import { Option, Schema } from "effect"
import * as Effect from "effect/Effect"
import { ProjectRequestForm, ProjectRequestStatus, ProjectSummary } from "../Domain/Project.js";
import { ProjectId } from "../Repository/Project.js";

import { ProjectRequest, ProjectRequestRepository } from "../Repository/ProjectRequestRepository.js";
import { BusinessRuleService } from "./BusinessRulesService.js";

export class ProjectRequestNotFound extends Schema.TaggedError<ProjectRequestNotFound>()(
    "ProjectRequestNotFound",
    {
        id: Schema.String,
        message: Schema.String,
    },
) { }

export class RepositoryError extends Schema.TaggedError<RepositoryError>()(
    "RepositoryError",
    {
        error: Schema.Unknown,
    },
) { }


export class ProjectRequestService extends Effect.Service<ProjectRequestService>()("app/ProjectRequest", {
    effect: Effect.gen(function* () {

        const { validateProjectRequest } = yield* BusinessRuleService
        
        const repository = yield* ProjectRequestRepository

        const create = Effect.fn("createProjectRequest")(function* (form: ProjectRequestForm) {
            return yield* repository.insertProjectRequest(form).pipe(
                Effect.catchTags({
                    ParseError: (parseError) => Effect.fail(new RepositoryError({ error: parseError })),
                    SqlError: (sqlError) => Effect.fail(new RepositoryError({ error: sqlError })),
                })
            )
        })

        const optionalProjectToStatus = Effect.fn("optionalProjectToStatus")(function* (id: string, projectOpt: Option.Option<ProjectRequest>) {
        
            return yield* Option.match(projectOpt,
                {
                    onNone: () => Effect.fail(
                        new ProjectRequestNotFound({
                            id,
                            message: `Project Request with id ${id} not found`,
                        })),
                    onSome: (projectRequest: ProjectRequest) => validateProjectRequest({project: projectRequest})
                }
            )
        })

        const viewStatus = (id: string) => Effect.gen(function* () {
            const foundProject = yield* repository.findProjectRequestById({ id })
            const status = yield* optionalProjectToStatus(id, foundProject)
            return status
        }).pipe(
            Effect.catchTags({
                ParseError: (parseError) => Effect.fail(new RepositoryError({ error: parseError })),
                SqlError: (sqlError) => Effect.fail(new RepositoryError({ error: sqlError })),
            })
        )

        const validate = Effect.fn("validateProjectRequest")(function* (id: string) {
            const projectId = ProjectId.make(id)
            const summary: ProjectSummary = {
                id: projectId,
                name: "New Project",
                budget: 10000,
                cost: 12000
            }
            return summary
        })

        return {
            create,
            viewStatus,
            validate
        };
    }),
    dependencies: [ BusinessRuleService.Default]
}) { }

