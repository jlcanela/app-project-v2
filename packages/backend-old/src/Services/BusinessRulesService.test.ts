
// UC 1
import { describe, expect, it } from "@effect/vitest"
import { isProjectInvalidStatus } from "../Domain/Project.js";
import { Effect } from "effect";
import { ProjectRequest } from "../Repository/ProjectRequestRepository.js";
import { BusinessRuleService } from "./BusinessRulesService.js";
import { ProjectId } from "../Repository/Project.js";

describe('ProjectRequest', () => {

    const TestLayer = BusinessRuleService.Default

    const projectRequest = ProjectRequest.make({
        id: ProjectId.make("some-uuid"),
        name: "project",
        budget: 15000, // triggers BUDGET_LIMIT_EXCEEDED & MARGIN_TO_LOW
        cost: 20000,    // triggers COST_LIMIT_EXCEEDED
        createdAt: new Date(),
        updatedAt: new Date()
    })

    it.effect(
        "should properly check validation of project request",
        () =>
            Effect.gen(function* () {
                const { validateProjectRequest } = yield* BusinessRuleService
                const status = yield* validateProjectRequest({ project: projectRequest })
                expect(isProjectInvalidStatus(status)).toBe(true)

                if (isProjectInvalidStatus(status)) {
                    const issues = status.issues

                    expect(issues).toEqual([
                        {
                            code: "BUDGET_LIMIT_EXCEEDED",
                            value: 15000,
                            parameter: 10000

                        },
                        {
                            code: "MARGIN_TO_LOW",
                            value: (15000 - 20000) / 15000,
                            parameter: 0.1
                        },
                        {
                            code: "COST_LIMIT_EXCEEDED",
                            value: 20000,
                            parameter: 9000
                        }
                    ])
                }
            }).pipe(
                Effect.provide(TestLayer)
            )
    )
});

