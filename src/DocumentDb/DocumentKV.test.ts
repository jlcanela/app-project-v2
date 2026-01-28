import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"
import * as Document from "./Document.js"

describe.concurrent("DocumentDB KV", () => {
  it.effect("upsert and getById should return the object", () =>
    Effect.gen(function*() {
      const db = yield* Document.DocumentDb
      const id = "123"
      const obj = { id: id, name: "demo" }

      yield* db.upsert(id, id, obj)

      const res = yield* db.get("123", "123")
      expect(res).toEqual(obj)
    }).pipe(Effect.provide(Document.layerKV)))

  it.effect("upsert and delete should remove the object", () =>
    Effect.gen(function*() {
      const db = yield* Document.DocumentDb
      const id = "123"
      const obj = { id: id, name: "demo" }

      yield* db.upsert(id, id, obj)
      yield* db.delete(id, id)

      const res = yield* db.get("123", "123")
      expect(res).toEqual(null)
    }).pipe(Effect.provide(Document.layerKV)))

  it.effect("query should return matching documents in a partition", () =>
    Effect.gen(function*() {
      const db = yield* Document.DocumentDb
      const p = "partitionA"

      const a = { id: "a", type: "task", title: "Do X" }
      const b = { id: "b", type: "task", title: "Do Y" }
      const c = { id: "c", type: "note", title: "Note Z" }

      yield* db.upsert(a.id, p, a)
      yield* db.upsert(b.id, p, b)
      yield* db.upsert(c.id, p, c)

      const tasks = yield* db.query<{ id: string; type: string; title: string }>({ type: "task" }, p)
      // order is not guaranteed; compare by id set
      const ids = tasks.map(t => t.id).sort()
      expect(ids).toEqual(["a","b"])
    }).pipe(Effect.provide(Document.layerKV)))
})
