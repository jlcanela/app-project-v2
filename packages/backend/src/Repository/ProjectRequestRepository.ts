import { SqlClient, SqlSchema } from "effect/unstable/sql"
import { Data, Effect, Layer, Schema, SchemaGetter, ServiceMap, flow } from "effect"

// Domain-level IDs
export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"))
export type ProjectId = typeof ProjectId.Type

// For creating a request from the service
export const ProjectRequestFormSchema = Schema.Struct({
  name: Schema.String,
  budget: Schema.Number,
  cost: Schema.Number,
})

export class GetProjectRequestError extends Data.TaggedError("GetProjectRequestError")<{
  error: unknown
}> {
  toString() {
    return `GetProjectRequestError: ${this.error}`
  }
}

const DateFromString = Schema.Date.pipe(
  Schema.encodeTo(Schema.String, {
    decode: SchemaGetter.Date(),
    encode: SchemaGetter.String()
  })
)

// Keep this shape in sync with your DB table and ProjectRequestForm / ProjectSummary
export class ProjectRequest extends Schema.Class<ProjectRequest>("ProjectRequest")({
  id: ProjectId,               // uuidv7() as string
  name: Schema.String,
  budget: Schema.Number,           // NUMERIC(12,2) ↔ number; you can swap for a branded decimal if needed
  cost: Schema.Number,
  createdAt: DateFromString,
  updatedAt: DateFromString,
}) { }

export class ProjectForm extends Schema.Class<ProjectForm>("ProjectForm")({
  id: ProjectId,
}) { }

// Keep this shape in sync with your DB table and ProjectRequestForm / ProjectSummary
export class Project extends Schema.Class<Project>("Project")({
  id: ProjectId,
  createdAt: DateFromString,
  updatedAt: DateFromString,
}) { }

const makeProjectRequestTestRepository = () => {
  const storeProjectRequest: ProjectRequest[] = []
  const storeProject: Project[] = []
  const now = () => new Date()

  const insertProjectRequest = (
    request: typeof ProjectRequestFormSchema.Type
  ): Effect.Effect<ProjectRequest> =>
    Effect.sync(() => {
      const projectRequest = new ProjectRequest({
        ...request,
        createdAt: now(),
        updatedAt: now(),
        id: ProjectId.makeUnsafe(crypto.randomUUID())
      })
      storeProjectRequest.push(projectRequest)
      return projectRequest
    })

  const findProjectRequestById = (
    request: { readonly id: string }
  ): Effect.Effect<ProjectRequest, GetProjectRequestError > => {
    const row = storeProjectRequest.find((r) => r.id === request.id)
    if (!row) {
      return Effect.fail(new GetProjectRequestError({ error: "ProjectRequest not found" }))
    }
    return Effect.succeed(row)
  }
    
  const findAllProjectRequests = (): Effect.Effect<
    Array<ProjectRequest>
  > =>
    Effect.sync(() => [...storeProjectRequest])

  const insertProject = (
    request: typeof ProjectForm.Type
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

  return {
    insertProjectRequest,
    findProjectRequestById,
    findAllProjectRequests,
    insertProject
  }
}

export class ProjectRequestRepository extends ServiceMap.Service<ProjectRequestRepository>()(
  "ProjectRequestRepository",
  {
    // dependencies: [PgLive],
    make: Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient

      const insertProjectRequest = flow(
        SqlSchema.findOne({
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
          SchemaError: (schemaError) => Effect.fail(new GetProjectRequestError({ error: schemaError })),
          NoSuchElementError: () =>
            Effect.die(
              "INSERT INTO project did not return anything",
            ),

          SqlError: () =>
            Effect.die(
              "INSERT INTO project_requests did not return anything",
            ),
        }),
        Effect.withSpan("insertProjectRequest"),
      );

      const findProjectRequestById = flow(
        SqlSchema.findOne({
          Request: Schema.Struct({ id: Schema.String }),
          Result: ProjectRequest,
          execute: (request) =>
            sql`SELECT * FROM project_requests WHERE id = ${request.id}`,
        }),
        Effect.catchTags({
          SchemaError: (schemaError) => Effect.fail(new GetProjectRequestError({ error: schemaError })),
          SqlError: (sqlError) => Effect.fail(new GetProjectRequestError({ error: sqlError })),
          NoSuchElementError: () => Effect.fail(new GetProjectRequestError({ error: "ProjectRequest not found" })),
        }),
        Effect.withSpan("findProjectRequestById"),
      );

      // Optionally: list all project requests
      const findAllProjectRequests = flow(
        SqlSchema.findAll({
          Request: Schema.Void,
          Result: ProjectRequest,
          execute: () => sql`SELECT * FROM project_requests ORDER BY created_at DESC`,
        }),
        Effect.catchTags({
          SchemaError: (schemaError) => Effect.fail(new GetProjectRequestError({ error: schemaError })),
          SqlError: (sqlError) => Effect.fail(new GetProjectRequestError({ error: sqlError })),
        }),
        Effect.withSpan("findAllProjectRequests"),
        //DieOnError,
      );

      // Insert a new project request
      // - DB generates id (uuidv7)
      // - issues starts as empty array
      const insertProject = flow(
        SqlSchema.findOne({
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
          SchemaError: (schemaError) => Effect.fail(new GetProjectRequestError({ error: schemaError })),
          SqlError: (sqlError) => Effect.fail(new GetProjectRequestError({ error: sqlError })),
          NoSuchElementError: () =>
            Effect.die(
              "INSERT INTO project did not return anything",
            ),
        }),
        Effect.withSpan("insertProject"),
      )

      return {
        // Insert a new project request
        // - DB generates id (uuidv7)
        // - issues starts as empty array
        insertProjectRequest,

        // Load a single project request by id (used by ProjectRequest.validate / viewStatus)
        findProjectRequestById,

        // Optionally: list all project requests
        findAllProjectRequests,

        // Insert a new project request
        // - DB generates id (uuidv7)
        // - issues starts as empty array
        insertProject
      }
    }),
  },
) {
  static readonly Test = Layer.succeed(ProjectRequestRepository)(makeProjectRequestTestRepository())
}
