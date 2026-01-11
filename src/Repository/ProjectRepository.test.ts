import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Schema } from "effect"
import { DeliverableId, Project, ProjectRepository, projectRepositoryConfig, ProjectRepositoryLive } from "./Project.js"
import { ProjectId } from "./Project.js"
import * as Document from "../DocumentDb/Document.js"
import { includeSecurityCondition, makeCosmosTransformer, SecurityPredicate } from "./Repository.js"
import { splitAggregateRoot } from "./Common.js"
import { OpenPolicyAgentApi } from "../lib/OpenPolicyAgentApi.js"
import { FetchHttpClient } from "@effect/platform"
import { interpret } from "@ucast/js"
import { fromOpaNode, OpaNode } from "../lib/ucast.js"
import { Condition } from "@ucast/mongo2js"

const sampleProject: Project = {
  id: ProjectId.make("proj-1"),
  name: "New Project",
  owner: "1234",
  budget: {
    amount: 100000
  },
  deliverables: [
    { id: DeliverableId.make("deliv-1"), name: "Deliverable 1" },
    { id: DeliverableId.make("deliv-2"), name: "Deliverable 2" }
  ]
};

const sampleProject2: Project = {
  id: ProjectId.make("proj-2"),
  name: "New Project",
  owner: "1234",
  budget: {
    amount: 100000
  },
  deliverables: [
    { id: DeliverableId.make("deliv-1"), name: "Deliverable 1" },
    { id: DeliverableId.make("deliv-2"), name: "Deliverable 2" }
  ]
};
const TestLive = Layer.mergeAll(ProjectRepositoryLive, Document.layerKV).pipe(Layer.provide(Document.layerKV))

describe("ProjectRepository utils", () => {
  it("Cosmos Transformer should convert to cosmos format", () => {
    const config = projectRepositoryConfig
    const partitionKey = config.aggregate.partitionKey
    const rootSchema = config.rootSchema()

    const RootFromCosmos = makeCosmosTransformer(config.root.type, config.aggregate.partitionKey, rootSchema)
    const { id, root, entities } = splitAggregateRoot(config, sampleProject)
    const newRoot = { id, [partitionKey]: id, ...root as object }

    const rootEncoded = Schema.encodeSync(RootFromCosmos)(newRoot)//.pipe(Effect.tapError((e) => Effect.logError(`Encoding error: ${e.message}`)))
    expect(rootEncoded).toEqual({
      "ProjectId": "proj-1",
      "id": "proj-1",
      "properties": {
        "name": "New Project",
        "owner": "1234",
      },
      "type": "project",
    })
  });
})

describe("ProjectRepository", () => {
  it.effect("upsert should create documents", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRepository
      const docDb = yield* Document.DocumentDb

      yield* repo.upsert(sampleProject)
      const docs = yield* docDb.query({}, sampleProject.id)
      expect(docs.length).toBe(4); // 1 project + 1 budget + 2 deliverables
    }).pipe(
      Effect.provide(TestLive)
    )
  )

  it.effect("upsert enable getById", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRepository
      yield* repo.upsert(sampleProject)
      const project = yield* repo.getById(sampleProject.id)
      expect({ ProjectId: sampleProject.id, ...sampleProject }).toEqual(project)
    }).pipe(
      Effect.provide(TestLive)
    )
  )

  it.effect("searches", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRepository
      yield* repo.upsert(sampleProject)
      yield* repo.upsert(sampleProject2)

      // const projects = yield* repo.search("").pipe(
      //   Effect.provide(SecurityPredicate.Default)
      // )
      // expect(projects).toEqual([sampleProject, sampleProject2].map(p => ({ ProjectId: p.id, ...p })))

      const query = JSON.stringify({
        "budget.amount": { $gte: 50000 },
        "deliverables": {
          $elemMatch: { name: "Deliverable 1" }
        }
      })

      const projectsFiltered = yield* repo.search(query).pipe(
        Effect.provide(SecurityPredicate.TestWithEmptyCondition)
      )

      expect(projectsFiltered).toEqual([sampleProject, sampleProject2].map(p => ({ ProjectId: p.id, ...p })))

    }).pipe(
      Effect.provide(TestLive)
    )
  )

  it.effect("searches with security filter", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRepository
      yield* repo.upsert(sampleProject)

      const projects = yield* repo.search("").pipe(
        Effect.provide(SecurityPredicate.Test({
          field: 'projects.owner',
          operator: 'eq',
          type: 'field',
          value: '1234'
        } as unknown as Condition<unknown>))
      )
      expect(projects).toEqual([sampleProject].map(p => ({ ProjectId: p.id, ...p })))


    }).pipe(
      Effect.provide(TestLive),
      //Effect.provideService(OpenPolicyAgentApi, OpenPolicyAgentApi.Test)        
    )
  )

  it.effect("verify security check", () => Effect.gen(function* () {
    const securityQuery: OpaNode = {
      field: 'projects.owner',
      operator: 'eq',
      type: 'field',
      value: '1234'
    }

    const condition = fromOpaNode(securityQuery)

    expect(condition).toEqual({
      "field": "projects.owner",
      "operator": "eq",
      "value": "1234",
    })
  }))

  it.effect("search condition is fine", () =>
    Effect.gen(function* () {

      const conditionTemplate = {
        field: "projects.owner",
        operator: "eq",
        type: "field",
        value: "1234"
      } as unknown as Condition<unknown>

      const query = ""
      const condition = yield* (includeSecurityCondition(query).pipe(
        Effect.provide(SecurityPredicate.Test(conditionTemplate))))

      expect({...condition, type: "field"}).toEqual(conditionTemplate)

      const predicate = (a: unknown) => interpret(condition, a) //condition2predicate(condition)

      const o = {
        projects: {
          owner: "1234"
        }
      }
      expect(predicate(o)).toEqual(true)
    }))

})
