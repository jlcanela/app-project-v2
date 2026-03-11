# Effect Atom v4 — Usage Guide

> **Status**: Unstable (`effect/unstable/reactivity`). Breaking changes may occur between minor versions.
> **Packages**: `effect` (core reactivity) + `@effect/atom-react` (React bindings)

---

## 1. Installation & Setup

```ts
// pnpm
pnpm add effect @effect/atom-react
```

### Provider

Wrap your app with `RegistryProvider` (React):

```tsx
import { RegistryProvider } from "@effect/atom-react"

function App() {
  return (
    <RegistryProvider defaultIdleTTL={5000}>
      <YourApp />
    </RegistryProvider>
  )
}
```

---

## 2. Core Concepts

Atoms are **stable reactive containers** — they work by reference and are created once, referenced everywhere. All components subscribing to the same atom re-render when it changes.

```ts
import * as Atom from "@effect/atom-react"

// Atoms are module-level singletons
export const counterAtom = Atom.make(0)
```

**Result states** — Effect/Stream atoms return `Result<A, E>`:
- `Initial` — not yet loaded
- `Success` — has value, `waiting` flag indicates if still active
- `Failure` — error as `Cause<E>`

---

## 3. Creating Atoms

### 3.1 `Atom.make` — Primary factory

```ts
// Signature overview:
make<A>(initialValue: A): Writable<A>
make<A>(create: (get: Context) => A): Atom<A>
make<A, E>(effect: Effect<A, E>): Atom<Result<A, E>>
make<A, E>(stream: Stream<A, E>): Atom<Result<A, E>>
```

```ts
// Simple writable state
const counter = Atom.make(0)

// Derived atom (read-only, auto-recomputes on dependency change)
const doubled = Atom.make((get) => get(counter) * 2)

// Async / Effect atom → returns Result<A, E>
const user = Atom.make(
  Effect.promise(() => fetch("/api/user").then((r) => r.json()))
)

// With initial value shown while loading
const data = Atom.make(fetchData, { initialValue: [] })
```

**Stream atom states:**
- `waiting: true` + `Success` → stream is still producing
- `waiting: false` + `Success` → stream completed
- `Failure<NoSuchElementException>` → stream ended without emitting

---

### 3.2 `Atom.readable` — Read-only derived

```ts
const fullName = Atom.readable((get) => {
  const user = get(userAtom)
  return `${user.firstName} ${user.lastName}`
})
```

---

### 3.3 `Atom.writable` — Derived with custom setter

```ts
// Signature:
writable<R, W>(
  read: (get: Context) => R,
  write: (ctx: WriteContext<R>, value: W) => void,
  refresh?: (f: <A>(atom: Atom<A>) => void) => void
): Writable<R, W>
```

**IIFE pattern** (keep internal atoms private):

```ts
import * as Data from "effect/Data"

type UserAction = Data.TaggedEnum<{
  UpdateName: { name: string }
  Invalidate: {}
}>
const UserAction = Data.taggedEnum<UserAction>()

const userAtom = (() => {
  const remote = runtime.atom(fetchUser)
  return Atom.writable(
    (get) => get(remote),
    (ctx, action: UserAction) => {
      switch (action._tag) {
        case "UpdateName":
          ctx.setSelf(Result.success({ ...ctx.get(remote).value, name: action.name }))
          break
        case "Invalidate":
          ctx.refresh(remote)
          break
      }
    },
    (refresh) => refresh(remote) // called when registry.refresh(userAtom) is invoked
  )
})()

// Usage
registry.set(userAtom, UserAction.UpdateName({ name: "Alice" }))
registry.refresh(userAtom) // triggers remote refetch
```

---

### 3.4 `Atom.fn` — Callable Effect atoms

```ts
// Signature:
fn<Arg, A, E>(
  fn: (arg: Arg, get: FnContext) => Effect<A, E>,
  options?: { initialValue?: A; concurrent?: boolean }
): AtomResultFn<Arg, A, E>
```

```ts
const saveTodo = Atom.fn(
  Effect.fn(function* (todo: Todo) {
    yield* Api.saveTodo(todo)
  })
)

// Trigger by setting a value:
registry.set(saveTodo, newTodo)

// With concurrent: false (default) → new calls interrupt in-progress ones
// With concurrent: true → run in parallel
```

---

### 3.5 `Atom.family` — Parameterized atom factory

```ts
// Signature:
family<Arg, T extends object>(f: (arg: Arg) => T): (arg: Arg) => T
```

```ts
// Basic usage — same key → same atom instance (cached)
const countByKey = Atom.family((key: string) => Atom.make(0))
countByKey("a") === countByKey("a") // true

// With Effect
const userById = Atom.family((id: string) =>
  Atom.make(Effect.promise(() => fetch(`/api/users/${id}`).then((r) => r.json())))
)
```

**Deep equality keys with `Data.Class`:**

```ts
import * as Data from "effect/Data"

class UserQuery extends Data.Class<{ id: string; includeProfile: boolean }> {}

const userAtom = Atom.family((query: UserQuery) =>
  Atom.make(fetchUser(query.id, query.includeProfile))
)

// Same structural value → same atom instance
userAtom(new UserQuery({ id: "1", includeProfile: true }))
userAtom(new UserQuery({ id: "1", includeProfile: true })) // same atom
```

---

### 3.6 `Atom.pull` — Stream pagination / infinite scroll

```ts
// Signature:
pull<A, E>(
  create: Stream<A, E> | ((get: Context) => Stream<A, E>),
  options?: { disableAccumulation?: boolean; initialValue?: ReadonlyArray<A> }
): Writable<PullResult<A, E>, void>

// PullResult<A, E> = Result<{ done: boolean; items: NonEmptyArray<A> }, E | NoSuchElementException>
```

```ts
const itemsAtom = Atom.pull(myStream)

// In React
const [result, pull] = useAtom(itemsAtom)

Result.builder(result)
  .onInitial(() => <p>Loading...</p>)
  .onFailure((cause) => <p>Error: {Cause.pretty(cause)}</p>)
  .onSuccess(({ items, done }, { waiting }) => (
    <div>
      <ul>{items.map((item) => <li key={item.id}>{item.name}</li>)}</ul>
      {!done && <button onClick={() => pull()}>Load more</button>}
      {waiting && <Spinner />}
    </div>
  ))
  .render()
```

**Cursor-based pagination:**

```ts
type Page<T> = { items: Array<T>; nextCursor: string | null }

const paginatedItems = runtime.pull((get) => {
  const query = get(searchInput$)
  return Stream.unfoldEffect(null as string | null, (cursor) =>
    Effect.gen(function* () {
      const api = yield* Api
      const page: Page<Item> = yield* api.getItems({ query, cursor })
      if (page.nextCursor === null)
        return Option.some([page.items, null] as const)
      return Option.some([page.items, page.nextCursor] as const)
    }).pipe(Effect.map(Option.filter(([items]) => items.length > 0)))
  ).pipe(Stream.flattenIterables)
})
```

---

### 3.7 `Atom.kvs` — Persisted atom (localStorage)

```ts
import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore"
import * as Schema from "effect/Schema"

const themeAtom = Atom.kvs({
  runtime: Atom.runtime(BrowserKeyValueStore.layerLocalStorage),
  key: "@myapp/theme",
  schema: Schema.Literal("light", "dark"),
  defaultValue: () => "light" as const,
})
```

---

## 4. Runtimes — Atoms with Services

`Atom.runtime` wraps Effect `Layer`s so atoms can access services.

```ts
import * as Layer from "effect/Layer"

// Create once at module level
const appRuntime = Atom.runtime(
  Layer.mergeAll(
    HttpClient.Default,
    DatabaseService.Live,
    ApiClient.Live
  )
)

// Atom using services
const usersAtom = appRuntime.atom(
  Effect.gen(function* () {
    const http = yield* HttpClient.HttpClient
    return yield* http.get("/api/users").pipe(HttpClientResponse.json)
  })
)

// Function atom with services
const createUser = appRuntime.fn<{ name: string }>()(
  Effect.fn(function* (input, get) {
    const http = yield* HttpClient.HttpClient
    return yield* http.post("/api/users", { body: input })
  })
)
```

> **Behavior**: `runtime.atom` waits for the Layer to resolve. If the Layer fails, all dependent atoms receive that error.

---

## 5. Atom Lifecycle Modifiers

```ts
// Keep atom alive after all subscribers unmount
const counter = Atom.make(0).pipe(Atom.keepAlive)

// Dispose N time after last subscriber disconnects (cache TTL)
const cached = Atom.make(fetchExpensiveData).pipe(
  Atom.setIdleTTL("30 seconds")
)

// Debounce value propagation
const searchInput = Atom.make("")
const debouncedSearch = searchInput.pipe(Atom.debounce("300 millis"))
```

**Debounce + reactive fetch pattern:**

```ts
const searchInput = Atom.make("")
const searchInput$ = searchInput.pipe(Atom.debounce("300 millis"))

const resultsAtom = runtime.atom((get) => {
  const query = get(searchInput$).trim()
  if (query.length <= 3) return Effect.succeed([])
  return Effect.gen(function* () {
    const api = yield* Api
    return yield* api.search(query)
  })
})
// searchInput$ changes → resultsAtom re-runs
```

---

## 6. Context: `get()` vs `get.result()`

| | `get(atom)` | `get.result(atom, opts?)` |
|---|---|---|
| Purpose | Reactive subscription | One-shot read in Effects |
| Re-runs on change | ✅ Yes | ❌ No |
| Returns | Value directly | `Effect<A, E>` |
| `suspendOnWaiting` | N/A | Waits if `waiting === true` |

```ts
// Reactive (creates subscription)
const derived = Atom.make((get) => get(baseAtom) * 2)

// One-shot read inside Atom.fn
const action = Atom.fn(
  Effect.fn(function* (_, get) {
    const user = yield* get.result(userAtom)
    // With suspend: waits for loading to finish
    const data = yield* get.result(dataAtom, { suspendOnWaiting: true })
    return { user, data }
  })
)
```

---

## 7. Optimistic Updates

```ts
const todos = Atom.make(fetchTodos)
const optimisticTodos = todos.pipe(Atom.optimistic)

const addTodo = optimisticTodos.pipe(
  Atom.optimisticFn({
    reducer: (current, newTodo: Todo) => [...current, newTodo], // instant UI
    fn: Atom.fn(
      Effect.fn(function* (todo) {
        yield* saveTodo(todo) // commit to server
      })
    ),
  })
)
// On error → optimistic value is discarded, source value restored
```

---

## 8. React Hooks

### Reading

```ts
// Read-only
const count = useAtomValue(counter)

// With inline selector (creates derived atom internally)
const doubled = useAtomValue(counter, (n) => n * 2)

// Suspense integration — suspends until Result is not Initial
const result = useAtomSuspense(userAtom)
// { suspendOnWaiting: true } → also suspends while waiting === true

// Side effect on value change
useAtomSubscribe(userAtom, (user) => analytics.track("user_changed", { user }))
useAtomSubscribe(userAtom, (user) => ..., { immediate: true }) // fires now too

// Mount only (keep atom alive while component is mounted)
useAtomMount(backgroundSyncAtom)
```

### Writing

```ts
// Read + write
const [count, setCount] = useAtom(counter)
setCount((n) => n + 1)

// Write only
const setTheme = useAtomSet(themeAtom)
setTheme("dark")

// With promise mode (await result)
const run = useAtomSet(saveTodo, { mode: "promise" })
const saved = await run(todo)

// With Exit (includes errors)
const run = useAtomSet(deleteTodo, { mode: "promiseExit" })
const exit = await run(id)
if (Exit.isSuccess(exit)) { ... }
```

### Rendering Result states

```tsx
// useAtomValue returns Result<A, E> for Effect/Stream atoms
const userResult = useAtomValue(userAtom)

// Fluent builder
Result.builder(userResult)
  .onInitial(() => <Skeleton />)
  .onWaiting(() => <Spinner />)
  .onSuccess((user, { waiting }) => (
    <div>
      <p>{user.name}</p>
      {waiting && <RefreshIndicator />}
    </div>
  ))
  .onFailure((cause) => <ErrorBanner message={Cause.pretty(cause)} />)
  .onErrorTag("NotFound", () => <NotFoundPage />)
  .render()
```

---

## 9. Direct Registry API (outside React)

```ts
import * as Registry from "@effect/atom-react/Registry"

const registry = Registry.make()

registry.get(atom)              // read value
registry.set(writableAtom, v)   // write value
registry.refresh(atom)          // force refetch
registry.mount(atom)            // returns unmount function
```

**Control function atoms:**

```ts
registry.set(longRunningFn, Atom.Interrupt) // interrupt ongoing Effect
registry.set(fnAtom, Atom.Reset)            // reset to initial state
```

---

## 10. Common Patterns

### Remote data + cache control

```ts
const userAtom = (() => {
  const remote = runtime.atom(
    Effect.gen(function* () {
      const api = yield* Api
      return yield* api.getUser()
    })
  )
  return Atom.writable(
    (get) => get(remote),
    (ctx, action: CacheAction) => {
      switch (action._tag) {
        case "Optimistic":
          ctx.setSelf(Result.success(action.value))
          break
        case "Invalidate":
          ctx.refresh(remote)
          break
      }
    },
    (refresh) => refresh(remote)
  )
})()
```

### Scoped resources with cleanup

```ts
const wsAtom = Atom.make(
  Effect.gen(function* () {
    const ws = yield* Effect.acquireRelease(
      connectWebSocket(),
      (ws) => Effect.sync(() => ws.close())
    )
    return ws
  })
)
// ws.close() is called automatically when atom is disposed
```

### Per-atom runtime isolation (testability)

```ts
// Create narrow runtimes per feature for isolation and easier testing
const authRuntime = Atom.runtime(AuthService.Live)
const cartRuntime = Atom.runtime(CartService.Live)

export const loginAtom = authRuntime.fn(...)
export const addToCartAtom = cartRuntime.fn(...)
```

---

## 11. Anti-Patterns

```ts
// ❌ Manual loading state — loses waiting control
const loading$ = Atom.make(false)
const user$ = Atom.make<User | null>(null)
const fetchUser = (id: string) => {
  registry.set(loading$, true)
  Effect.runPromise(userService.getById(id)).then((u) => {
    registry.set(user$, u)
    registry.set(loading$, false)
  })
}

// ✅ Use Atom.fn — loading/success/failure handled automatically
const fetchUser = Atom.fn(
  Effect.fn(function* (id: string) {
    return yield* userService.getById(id)
  })
)
// result.waiting, Result.match — all built-in
```

```ts
// ❌ Creating atoms inside components — new instance on every render
function MyComponent() {
  const atom = Atom.make(0) // ← wrong
}

// ✅ Define atoms at module level
export const countAtom = Atom.make(0)
function MyComponent() {
  const count = useAtomValue(countAtom)
}
```

---

## 12. Key Principles

| Principle | Summary |
|---|---|
| **Atoms by reference** | Define once at module level, reference everywhere |
| **`Atom.fn` for async** | Gives automatic `waiting` + `Result` type |
| **Never manual void wrappers** | You lose `waiting` control |
| **`Atom.family` for dynamic state** | Stable references with cached instances |
| **Automatic cleanup** | Atoms reset on last unsubscribe (unless `keepAlive`) |
| **Derive, don't coordinate** | Compute derived state via `get()` instead of syncing manually |
| **Narrow runtimes** | One `Atom.runtime` per feature domain for isolation |
| **Immutable updates** | Always produce new values, never mutate in place |
