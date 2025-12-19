import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { DeliverableId, Project, ProjectRepository, ProjectRepositoryLive } from "./Project.js"
import { ProjectId } from "./Project.js"
import * as Document from "../DocumentDb/Document.js"

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

const TestLive = Layer.mergeAll(ProjectRepositoryLive, Document.layerKV).pipe(Layer.provide(Document.layerKV))

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
      expect(project).toEqual(sampleProject)
    }).pipe(
      Effect.provide(TestLive)
    )
  )
})
