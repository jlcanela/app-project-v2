# ---- Base ----
# Use Node.js 22 Alpine as a base image. Node.js 25 is not yet released;
# 22 is the current Long-Term Support (LTS) version.
# Alpine is a lightweight Linux distribution, ideal for production images.
FROM node:22-alpine AS builder
WORKDIR /repo

# Enable corepack (bundled with recent Node)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY .npmrc ./ 
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
# Copy only package.json files to cache dependency installation
COPY packages/backend/package.json ./packages/backend/
COPY packages/domain/package.json ./packages/domain/
COPY packages/frontend/package.json ./packages/frontend/
COPY package.json .

# Install all deps (build time)
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

COPY packages/backend ./packages/backend
COPY packages/domain ./packages/domain

# Build backend
RUN pnpm --filter @app/backend build

# Produce a pruned deploy dir for just backend (code + prod deps)
FROM builder AS backend-deploy
WORKDIR /repo
RUN pnpm --filter @app/backend --prod deploy ./backend-dist

# ---- Production ----
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=backend-deploy /repo/backend-dist/dist/index.mjs .
COPY --from=backend-deploy /repo/backend-dist/node_modules ./node_modules
COPY packages/backend/rules ./rules 
COPY packages/backend/local.db .
COPY packages/backend/package.json .
COPY packages/frontend/dist ./frontend
COPY packages/opa/project/bundle.tar.gz ./opa/bundle.tar.gz

EXPOSE 3000
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

CMD ["node", "index.mjs", "frontend"]