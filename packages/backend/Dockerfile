# ---- Base ----
# Use Node.js 22 Alpine as a base image. Node.js 25 is not yet released;
# 22 is the current Long-Term Support (LTS) version.
# Alpine is a lightweight Linux distribution, ideal for production images.
FROM node:22-alpine AS base
WORKDIR /app
# Install pnpm globally
RUN npm install -g pnpm

# ---- Dependencies ----
# This stage is for installing dependencies. It's a separate stage to
# leverage Docker's layer caching. It will only be re-run if package
# definitions or lockfiles change.
FROM base AS deps
# Copy workspace configuration and root package definitions
COPY .npmrc ./ 
COPY pnpm-lock.yaml ./ 
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy package.json for all workspace packages to resolve dependencies.
# This is more efficient than copying the entire source code at this stage.
COPY packages/backend/package.json ./packages/backend/
COPY packages/domain/package.json ./packages/domain/
COPY packages/frontend/dist ./packages/frontend/dist 

# Install all dependencies (including dev dependencies needed for building)
RUN pnpm install --frozen-lockfile

# ---- Builder ----
# This stage builds the TypeScript source code into JavaScript.
FROM base AS builder
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy workspace configuration and package definitions again
COPY .npmrc ./ 
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

COPY packages/backend/ ./packages/backend/
COPY packages/domain/ ./packages/domain/
COPY packages/frontend/dist ./packages/frontend/dist

# Install all deps (build time)
RUN pnpm install --frozen-lockfile

# Build backend
RUN pnpm --filter @app/backend build

# Create a deployable folder with only prod deps for backend
RUN pnpm --filter @app/backend --prod deploy /app/deploy/backend

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/deploy/backend/dist/index.mjs ./index.mjs 
COPY --from=builder /app/deploy/backend/rules ./rules 
COPY --from=builder /app/deploy/backend/package.json ./package.json
COPY --from=builder /app/deploy/backend/node_modules ./node_modules

COPY packages/frontend/dist ./frontend
COPY packages/opa/project/bundle.tar.gz ./opa/bundle.tar.gz

EXPOSE 3000
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

CMD ["node", "index.mjs", "frontend"]