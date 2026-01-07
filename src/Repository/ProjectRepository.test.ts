import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Schema } from "effect"
import { DeliverableId, Project, ProjectRepository, projectRepositoryConfig, ProjectRepositoryLive } from "./Project.js"
import { ProjectId } from "./Project.js"
import * as Document from "../DocumentDb/Document.js"
import { makeCosmosTransformer, SecurityPredicate } from "./Repository.js"
import { splitAggregateRoot } from "./Common.js"

const sampleProject: Project = {
  id: ProjectId.make("proj-1"),
  name: "New Project",
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

      const projects = yield* repo.search("").pipe(
        Effect.provide(SecurityPredicate.Default)
      )
      expect(projects).toEqual([sampleProject, sampleProject2].map(p => ({ ProjectId: p.id, ...p })))

      const query = JSON.stringify({
        "budget.amount": { $gte: 50000 },
        deliverables: {
          $elemMatch: { name: "Deliverable 1" }
        }
      })
      
      const projectsFiltered = yield* repo.search(query).pipe(
        Effect.provide(SecurityPredicate.Default
      ))
      
      expect(projectsFiltered).toEqual([sampleProject, sampleProject2].map(p => ({ ProjectId: p.id, ...p })))

    }).pipe(
      Effect.provide(TestLive)
    )
  )
})
