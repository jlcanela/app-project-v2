import { Option, Schema } from "effect"
import * as Effect from "effect/Effect"
import { isProjectInvalidStatus, ProjectRequestForm, ProjectSummary } from "../Domain/Project.js";
import { ProjectForm, ProjectRequest, ProjectRequestRepository } from "../Repository/ProjectRequestRepository.js";
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
            const foundProject = yield* Option.match(yield* repository.findProjectRequestById({ id }), {
                onNone: () => Effect.fail(new ProjectRequestNotFound({
                    id,
                    message: `Project Request with id ${id} not found`,
                })),
                onSome: (projectRequest: ProjectRequest) => Effect.succeed(projectRequest)
            })
            const status = yield* optionalProjectToStatus(id, Option.some(foundProject))
            if (isProjectInvalidStatus(status)) {
                yield* Effect.fail(new Error(`Project Request with id ${id} is invalid`))
            }
            const created = yield* repository.insertProject(new ProjectForm({
                id: foundProject.id,
            }))
           
            return ProjectSummary.make({
                id: created.id,
                name: foundProject.name,
                budget: foundProject.budget,
                cost: foundProject.cost
            })
        })

        return {
            create,
            viewStatus,
            validate
        };
    }),
    dependencies: [ BusinessRuleService.Default]
}) { }

