import { Entity, ShardingConfig } from "@effect/cluster"
import { assert, describe, it } from "@effect/vitest"
import { Effect } from "effect"
import { Project, TestProject, TestEntityLayer } from "./ProjectEntity.js"

describe.concurrent("Entity", () => {
  describe("makeTestClient", () => {
    it.scoped("round trip", () =>
      Effect.gen(function*() {
        const makeClient = yield* Entity.makeTestClient(TestProject, TestEntityLayer)
        const client = yield* makeClient("123")
        const project = yield* client.SubmitProject({ id: 1 })
        assert.deepEqual(project, new Project({ id: 1, name: "Project 1" }))               
      }).pipe(Effect.provide(TestShardingConfig)))
    it.scoped("round trip2", () =>
      Effect.gen(function*() {
        const makeClient = yield* Entity.makeTestClient(TestProject, TestEntityLayer)
        const client = yield* makeClient("123")
        const validatedProject = yield* client.ValidateProject({ id: 1 })
        assert.deepEqual(validatedProject, new Project({ id: 1, name: "Project 1" }))
      }).pipe(Effect.provide(TestShardingConfig)))
  })
})

const TestShardingConfig = ShardingConfig.layer({
  shardsPerGroup: 300,
  entityMailboxCapacity: 10,
  entityTerminationTimeout: 0,
  entityMessagePollInterval: 5000,
  sendRetryInterval: 100
})

