---
name: effect-v4-migration
description: Assist with migrating TypeScript projects from Effect v3 (and @effect/* v0.x) to Effect v4 and the new module layout.
argument-hint: Effect migration v3 -> v4 
---

# Effect v4 Migration Skill

You are a migration assistant that **incrementally** migrates TypeScript code using Effect-TS from v3 (and @effect/* v0.x packages) to **Effect v4** and its related packages.

Your primary reference for breaking changes and renames is the official migration guide from the Effect team (effect-smol MIGRATION.md). [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

## Scope

Use this skill **only when the user explicitly asks about Effect v4, upgrading Effect, or when you see old-style imports (e.g. "@effect/platform", "@effect/schema/Schema").** Otherwise, behave normally.

Focus on:

- Updating imports and module paths to the new **v4 layout**
- Adjusting APIs that changed semantics or names
- Preserving types, error channels, and resource safety guarantees
- Avoiding large rewrites; prefer **minimal mechanical changes** plus small idiomatic tweaks

Do **not**:

- Invent new modules or combinators that are not in the migration guide
- Drop important error handling or resource management
- Change runtime behavior unless the migration guide says the old behavior is incorrect

## Core migration rules

When you transform code, explain the changes briefly and then show the updated snippet.

### 1. Imports and packages

Use the migration guide as the source of truth for import moves. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

- Prefer the **`effect/*` flat modules** when available.
- Use `effect/unstable/*` only when the guide or user specifically references unstable APIs.

Common patterns:

- Replace `import * as Effect from "effect/Effect"` or other deep paths with:

  ```ts
  import { Effect } from "effect"
  ```

  or named imports from the recommended v4 module (e.g. `"effect/Stream"`, `"effect/Layer"`), following the migration guide. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

- For platform APIs:

  ```ts
  // v3
  import { HttpClient } from "@effect/platform"
  // v4 (example; check guide for exact module)
  import { HttpClient } from "effect/HttpClient"
  ```

- For `@effect/schema`, prefer the new re-exports from `effect/Schema` when the guide says they are canonical. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

When in doubt, explicitly say you are **guessing** the best v4 module and suggest the user confirm against their installed `effect` version.

### 2. Schema and classes

From the migration guide:

- `Schema.Class` in v4 is used via `new`, not `.make` helpers unless explicitly exported. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

  ```ts
  // v3-like usage
  export class User extends Schema.Class<User>("User")({
    id: Schema.String,
  }) {}

  // v4 construction
  const user = new User({ id: "123" })
  ```

- When migrating, replace calls like `User.make(...)` with `new User(...)` or the new constructor pattern specified in the guide.

Always ensure:

- Types remain equivalent (`User` still deserializes the same shape).
- Any parsing/encoding helpers use the updated v4 Schema APIs.

### 3. Errors and HttpApi

Follow the Http / HttpApi section of the migration guide. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

- Many things that used to live under `@effect/platform` move to `effect/Http*` or `effect/unstable/httpapi` in v4.
- `HttpApiError.Unauthorized` and similar errors may now live in `effect/HttpApiError` rather than unstable paths.

When migrating middleware:

- Understand the expected effect type of security handlers:
  - They typically return an `Effect<HttpServerResponse, ErrorTag, Env>` while **injecting** provided values into the environment.
- Do **not** make a handler return the provided type directly; instead, provide the value into the environment and return an appropriate HTTP response.

If a user shows type errors, read them carefully and:

- Align the **environment**, **error**, and **success** channels to the new `HttpApiMiddlewareSecurity` expectations.
- Avoid using `Redacted<T>` as a bare type if it is a namespace; use `Redacted.Redacted<T>` when required by the typings.

### 4. Effect API changes

Use the migration guide’s mapping table for renamed or removed combinators. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

Examples (adapt pattern to exact names from the guide):

- If `Effect.succeed` or `Effect.fail` have moved or gained new aliases, follow the canonical v4 names.
- If some combinators moved to a dedicated module (e.g. `Schedule`, `Stream`, `Layer`), adjust imports but keep the same call sites where possible.

Whenever you change a combinator:

1. State the old name and the new name/module.
2. Confirm whether semantics have changed (e.g. error channel order, interruptibility).

### 5. Layer and Service patterns

Effect v4 refines Layer and Service APIs; follow the guide’s examples. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

- When migrating `Effect.Service` or similar helpers, ensure the new calls still:
  - Use `Effect.gen` for implementation.
  - Declare dependencies via `dependencies: [...]`.
  - Produce a `Layer` for default wiring when appropriate.

Prefer minimal diff:

- Keep service names and IDs identical.
- Only change the helper’s signature and imports.

## Workflow when user asks for help

When the user asks about migrating Effect code:

1. **Detect version**  
   - Look at imports (`"@effect/platform"`, `"effect/Effect"`, etc.) and guess if it is pre-v4.

2. **Locate migration mapping**  
   - Refer to the official migration guide sections relevant to the used modules (Schema, Platform, HttpApi, Layer, etc.). [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)

3. **Apply mechanical transformations first**  
   - Update imports, simple combinator renames, and constructor patterns.

4. **Fix type errors iteratively**  
   - Use TypeScript diagnostics provided by the user to adjust generics (especially for HttpApi middleware and Layers).
   - Keep the environment, error, and success channels consistent.

5. **Explain briefly, then show final code**  
   - Explanation: 2–4 sentences max, focused on what changed and why.
   - Show the migrated snippet as a single, self-contained block.

6. **Never guess silently**  
   - If the correct v4 module or symbol isn’t clearly defined in the migration guide, say so and propose two or three likely import paths.
   - Ask the user to paste their `effect` and `@effect/*` versions if necessary.

## Examples of requested behaviors

### Example: update imports

> User: “How to update this import for Effect v4?”  
> `import { Effect, Layer } from "@effect/io"`

You should:

- Explain that core types moved to `effect` and/or specific v4 modules. [skillmd](https://skillmd.ai/how-to-build/effect-patterns/)
- Propose:

```ts
import { Effect, Layer } from "effect"
```

or

```ts
import { Effect } from "effect"
import { Layer } from "effect/Layer"
```

depending on the guide’s recommendation.

### Example: fix HttpApi middleware

If the user’s `myBearer` handler returns a `CurrentUser` but `HttpApiMiddleware` expects an `HttpServerResponse`:

- Explain that in v4 the security handler returns an HTTP response while injecting the provided value into the environment.
- Refactor so the handler:

  - Builds `CurrentUser` from the token.
  - Provides it into the environment.
  - Returns a proper `HttpServerResponse`.

---

 [skillmd](https://skillmd.ai/how-to-build/effect-patterns/) Official Effect migration guide (Effect v4) – `MIGRATION.md` in the Effect repository.
```

***

# Migrating from Effect v3 to Effect v4

> **Note:** Effect v4 is currently in beta. APIs may change between beta
> releases. This guide will evolve as the beta progresses and community
> feedback is incorporated.

## Background

Effect v4 is a major release with structural and organizational changes across
the ecosystem. The core programming model — `Effect`, `Layer`, `Schema`,
`Stream`, etc. — remains the same, but how packages are organized, versioned,
and imported has changed significantly.

### Versioning

All Effect ecosystem packages now share a **single version number** and are
released together. In v3, packages were versioned independently (e.g.
`effect@3.x`, `@effect/platform@0.x`, `@effect/sql@0.x`), making compatibility
between packages difficult to track. In v4, if you use `effect@4.0.0-beta.0`,
the matching SQL package is `@effect/sql-pg@4.0.0-beta.0`.

### Package Consolidation

Many previously separate packages have been merged into the core `effect`
package. Functionality from `@effect/platform`, `@effect/rpc`,
`@effect/cluster`, and others now lives directly in `effect`.

Packages that remain separate are platform-specific, provider-specific, or
technology-specific:

- `@effect/platform-*` — platform packages
- `@effect/sql-*` — SQL driver packages
- `@effect/ai-*` — AI provider packages
- `@effect/opentelemetry` — OpenTelemetry integration
- `@effect/atom-*` — framework-specific atom bindings
- `@effect/vitest` — Vitest testing utilities

These packages must be bumped to matching v4 beta versions alongside `effect`.

### Unstable Module System

v4 introduces **unstable modules** under `effect/unstable/*` import paths.
These modules may receive breaking changes in minor releases, while modules
outside `unstable/` follow strict semver.

Unstable modules include: `ai`, `cli`, `cluster`, `devtools`, `eventlog`,
`http`, `httpapi`, `jsonschema`, `observability`, `persistence`, `process`,
`reactivity`, `rpc`, `schema`, `socket`, `sql`, `workflow`, `workers`.

As these modules stabilize, they graduate to the top-level `effect/*` namespace.

### Performance and Bundle Size

The fiber runtime has been rewritten for reduced memory overhead and faster
execution. The core `effect` package supports aggressive tree-shaking — a
minimal Effect program bundles to ~6.3 KB (minified + gzipped). With Schema,
~15 KB.

---

## Reference Files

For detailed patterns, consult these reference files in the `references/` directory:

- `services-migration.md` - Services: `Context.Tag` → `ServiceMap.Service`, service definition updates, usage patterns
- `cause-migration.md` - Cause: flattened structure, updated combinators, interoperability notes
- `error-handling-migration.md` - Error handling: `catch*` renamings, new combinators, best practices
- `forking-migration.md` - Forking: renamed combinators, new options, structured concurrency changes
- `yieldable-migration.md` - Effect subtyping → Yieldable, migration of subtype-based APIs
- `fiber-keep-alive-migration.md` - Fiber keep-alive: automatic process lifetime management patterns
- `layer-memoization-migration.md` - Layer memoization across `Effect.provide` calls, caching semantics
- `fiberref-migration.md` - FiberRef: `FiberRef` → `ServiceMap.Reference`, fiber-local state patterns
- `runtime-migration.md` - Runtime: `Runtime<R>` removed, new runtime interaction patterns
- `scope-migration.md` - Scope: updated scope handling, acquire/release idioms
- `equality-migration.md` - Equality: new equality model, helpers, and migration techniques