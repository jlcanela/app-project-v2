import { Layer, Schema, ServiceMap } from "effect"
import * as Effect from "effect/Effect"
import { isProjectInvalidStatus, ProjectRequestForm, ProjectSummary } from "../Domain/Project.js";
import { ProjectForm, ProjectRequestRepository } from "../Repository/ProjectRequestRepository.js";
import { BusinessRuleService } from "./BusinessRulesService.js";

export class ProjectRequestNotFound extends Schema.TaggedErrorClass<ProjectRequestNotFound>()(
    "ProjectRequestNotFound",
    {
        id: Schema.String,
        message: Schema.String,
    },
) { }

export class RepositoryError extends Schema.TaggedErrorClass<RepositoryError>()(
    "RepositoryError",
    {
        error: Schema.Unknown,
    },
) { }


export class ProjectRequestService extends ServiceMap.Service<ProjectRequestService>()("app/ProjectRequest", {
    make: Effect.gen(function* () {

        const { validateProjectRequest } = yield* BusinessRuleService
        
        const repository = yield* ProjectRequestRepository

        const create = Effect.fn("createProjectRequest")(function* (form: ProjectRequestForm) {
            return yield* repository.insertProjectRequest(form).pipe(
            )
        })

        const viewStatus = (id: string) => Effect.gen(function* () {
            const foundProject = yield* repository.findProjectRequestById({ id })
            return yield* validateProjectRequest({project: foundProject})
        }).pipe(
        )

        const validate = Effect.fn("validateProjectRequest")(function* (id: string) {
            const foundProject = yield* repository.findProjectRequestById({ id })
            const status = yield* validateProjectRequest({project: foundProject})
            if (isProjectInvalidStatus(status)) {
                return yield* Effect.fail(new Error(`Project Request with id ${id} is invalid`))
            }
            const created = yield* repository.insertProject(new ProjectForm({
                id: foundProject.id,
            }))
           
            return ProjectSummary.makeUnsafe({
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
}) {
    static layer = Layer.effect(this, this.make)
 }

