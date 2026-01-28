
// UC 1
import { describe, expect, it } from "@effect/vitest"
import { ProjectRequestService } from "./ProjectRequestService.js";
import { isProjectInvalidStatus, ProjectRequestForm, ProjectSummary } from "../Domain/Project.js";
import { Effect, Layer } from "effect";
import { ProjectRequestRepository } from "../Repository/ProjectRequestRepository.js";

describe('ProjectRequest', () => {

  const form: ProjectRequestForm = {
    name: "project",
    budget: 5000,
    cost: 4500
  }

  const TestLayer = ProjectRequestService.Default.pipe(
    Layer.provideMerge( ProjectRequestRepository.Test)
  )

  it.effect('should create a project request with valid parameters', () => Effect.gen(function* () {

    const projectRequestService = yield* ProjectRequestService
    const projectRequest = yield* projectRequestService.create(form)

    const expectedProjectRequest = {
      ...form,
      id: projectRequest.id, // dynamic id
      createdAt: projectRequest.createdAt, // dynamic timestamp
      updatedAt: projectRequest.updatedAt  // dynamic timestamp
    }

    expect(projectRequest).toEqual(expectedProjectRequest)
  }).pipe(
    Effect.provide(TestLayer))
  )

  it.effect(
    "should manage invalid project request",
    () =>
      Effect.gen(function* () {
        const projectRequestService = yield* ProjectRequestService

        const projectRequest = yield* projectRequestService.create({
          ...form,
          budget: 15000, // triggers BUDGET_LIMIT_EXCEEDED & MARGIN_TO_LOW
          cost: 20000    // triggers COST_LIMIT_EXCEEDED
        })

        const status = yield* projectRequestService.viewStatus(projectRequest.id)

        expect(isProjectInvalidStatus(status)).toBe(true)
        if (isProjectInvalidStatus(status)) {
          const issues = status.issues
          expect(issues.length).toBe(3)
        }
      }).pipe(
        Effect.provide(TestLayer)
      )
  )

  it.effect(
    "should manage valid project request",
    () =>
      Effect.gen(function* () {
        const projectRequestService = yield* ProjectRequestService
        const projectRequest = yield* projectRequestService.create(form)
        const status = yield* projectRequestService.viewStatus(projectRequest.id)
        expect(isProjectInvalidStatus(status)).toBe(false)
      }).pipe(
        Effect.provide(TestLayer)
      )
  )

    it.effect(
    "should create project on validate request",
    () =>
      Effect.gen(function* () {
        const projectRequestService = yield* ProjectRequestService
        const projectRequest = yield* projectRequestService.create(form)
        const summary = yield* projectRequestService.validate(projectRequest.id)
        expect(summary).toStrictEqual(ProjectSummary.make({
          id: projectRequest.id,
          name: form.name,
          budget: form.budget,
          cost: form.cost
        }))
      }).pipe(
        Effect.provide(TestLayer)
      )
  )
});
