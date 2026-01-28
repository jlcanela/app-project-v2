import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Layer, Schema, flow } from "effect"
import * as Option from "effect/Option"

// Domain-level IDs
export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"))
export type ProjectId = typeof ProjectId.Type

// For creating a request from the service
export const ProjectRequestFormSchema = Schema.Struct({
  name: Schema.String,
  budget: Schema.Number,
  cost: Schema.Number,
})

// Keep this shape in sync with your DB table and ProjectRequestForm / ProjectSummary
export class ProjectRequest extends Schema.Class<ProjectRequest>("ProjectRequest")({
  id: ProjectId,               // uuidv7() as string
  name: Schema.String,
  budget: Schema.Number,           // NUMERIC(12,2) ↔ number; you can swap for a branded decimal if needed
  cost: Schema.Number,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}) {}

export class ProjectForm extends Schema.Class<ProjectForm>("ProjectForm")({
  id: ProjectId,
}) {}

// Keep this shape in sync with your DB table and ProjectRequestForm / ProjectSummary
export class Project extends Schema.Class<Project>("Project")({
  id: ProjectId,
  createdAt: Schema.DateFromString,
  updatedAt: Schema.DateFromString,
}) {}

export class ProjectRequestRepository extends Effect.Service<ProjectRequestRepository>()(
  "ProjectRequestRepository",
  {
   // dependencies: [PgLive],
    effect: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      return {
        // Insert a new project request
        // - DB generates id (uuidv7)
        // - issues starts as empty array
        insertProjectRequest: flow(
          SqlSchema.single({
            Request: ProjectRequestFormSchema,
            Result: ProjectRequest,
            execute: (request) =>
              sql`
                INSERT INTO project_requests (name, budget, cost)
                VALUES (${request.name}, ${request.budget}, ${request.cost})
                RETURNING *
              `,
          }),
          Effect.catchTags({
            NoSuchElementException: () =>
              Effect.dieMessage(
                "INSERT INTO project_requests did not return anything",
              ),
          }),
          Effect.withSpan("insertProjectRequest"),
        ),

        // Load a single project request by id (used by ProjectRequest.validate / viewStatus)
        findProjectRequestById: flow(
          SqlSchema.findOne({
            Request: Schema.Struct({ id: Schema.String }),
            Result: ProjectRequest,
            execute: (request) =>
              sql`SELECT * FROM project_requests WHERE id = ${request.id}`,
          }),
          Effect.withSpan("findProjectRequestById"),
          //DieOnError,
        ),

        // Optionally: list all project requests
        findAllProjectRequests: flow(
          SqlSchema.findAll({
            Request: Schema.Void,
            Result: ProjectRequest,
            execute: () => sql`SELECT * FROM project_requests ORDER BY created_at DESC`,
          }),
          Effect.withSpan("findAllProjectRequests"),
          //DieOnError,
        ),

                // Insert a new project request
        // - DB generates id (uuidv7)
        // - issues starts as empty array
        insertProject: flow(
          SqlSchema.single({
            Request: ProjectForm,
            Result: Project,
            execute: (request) =>
              sql`
                INSERT INTO project (id)
                VALUES (${request.id})
                RETURNING *
              `,
          }),
          Effect.catchTags({
            NoSuchElementException: () =>
              Effect.dieMessage(
                "INSERT INTO project did not return anything",
              ),
          }),
          Effect.withSpan("insertProject"),
        ),
      }
    }),
  },
) {
     static readonly Test = Layer.succeed(ProjectRequestRepository, (()  => {
    // simple in-memory store
    const storeProjectRequest: ProjectRequest[] = []
    const storeProject: Project[] = []

    const now = () => new Date()

    const insertProjectRequest = (request: typeof ProjectRequestFormSchema.Type
    ): Effect.Effect<ProjectRequest> =>
      Effect.sync(() => {
        const projectRequest = new ProjectRequest({
            ...request,
            createdAt: now(),
            updatedAt: now(),
            id: ProjectId.make(crypto.randomUUID())
        })

        storeProjectRequest.push(projectRequest)
        return projectRequest
      })

    const findProjectRequestById = (request: {
        readonly id: string
     }): Effect.Effect<Option.Option<ProjectRequest>> =>
      Effect.sync(() => {
        const row = storeProjectRequest.find((r) => r.id === request.id)
        if (!row) {
            return Option.none()
        }
        return Option.some(row)
      })

    const findAllProjectRequests = (): Effect.Effect<
      ReadonlyArray<ProjectRequest>
    > => Effect.sync(() => [...storeProjectRequest])

     const insertProject = (request: typeof ProjectForm.Type
    ): Effect.Effect<Project> =>
      Effect.sync(() => {
        const project = new Project({
            ...request,
            createdAt: now(),
            updatedAt: now()
        })
        storeProject.push(project)
        return project
      })
    // Provide the same shape as the real service
    return new ProjectRequestRepository({
      insertProjectRequest,
      findProjectRequestById,
      findAllProjectRequests,
      insertProject,
    })
  })())
}
