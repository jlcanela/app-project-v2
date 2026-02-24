import {
    HttpApi,
    HttpApiBuilder,
    HttpApiEndpoint,
    HttpApiError,
    HttpApiGroup,
} from "effect/unstable/httpapi"
import { Effect, Layer, Schema } from "effect"

import { AuthParams, genToken, JWT } from "./lib/auth.js";
import { Authorization, User } from "./lib/authorization.js";

import { ProjectId } from "./Domain/Project.js";

const auth = HttpApiEndpoint.post("auth", "/", {
    payload: AuthParams, 
    success: JWT,
    error: HttpApiError.Forbidden
})
  
export const AuthApi = HttpApiGroup.make("AuthApi")
    .add(auth)
    .prefix("/auth")

const OffsetPagination = Schema.Struct({
    limit: Schema.NumberFromString,
    offset: Schema.NumberFromString
})

const ProjectListQuery = {
    search: Schema.optional(Schema.String),
    fields: Schema.optional(Schema.String),
    limit: Schema.optional(Schema.NumberFromString),
    offset: Schema.optional(Schema.NumberFromString),
    continuationToken: Schema.optional(Schema.String)
}
const PLQ = Schema.Struct(ProjectListQuery) 


type ProjectListQuery = typeof PLQ.Type

// Path params
const projectIdParam = {
    "projectId": ProjectId
}
//const deliverableIdParam = HttpApiSchema.param("deliverableId", DeliverableId)

// Project Aggregate API Endpoints

// GET /search
export const search = HttpApiEndpoint.get("search", "/search", {
    params: ProjectListQuery,
    success: Schema.Array(Schema.Number),
    error: [Schema.String, HttpApiError.InternalServerError]
})

// GET /projects?limit=&offset=&search=
export const getProjects = HttpApiEndpoint.get("getProjects", "/projects", {
    params: ProjectListQuery,
    success: Schema.Array(Schema.Number)
})

// POST /projects
export const newProject = HttpApiEndpoint.post("createProject", "/projects", {
    payload: Schema.Number,          // or a narrower CreateProject schema
    success: Schema.Number
})

// GET /projects/:projectId
export const getProject = HttpApiEndpoint.get("getProject", `/projects/${projectIdParam}`, {
    success: Schema.Number
})

// PUT /projects/:projectId  (full replace / upsert)
export const updateProject = HttpApiEndpoint.put("updateProject", `/projects/${projectIdParam}`, {
    payload: Schema.Number,
    success: Schema.Number
})

// PATCH /projects/:projectId  (partial update of root)
const PatchProject = Schema.optional(Schema.Number)
export const patchProject = HttpApiEndpoint.patch("patchProject", `/projects/${projectIdParam}`, {
    payload: PatchProject,
    success: Schema.Number
})

// DELETE /projects/:projectId
export const deleteProject = HttpApiEndpoint.delete("deleteProject", "/projects/${projectIdParam}")
// if you want a body, keep `addSuccess(Project)`, otherwise just 204

// // Budget API Endpoints

// // GET /projects/:projectId/budget
// export const getBudget = HttpApiEndpoint.get("getBudget")`/projects/${projectIdParam}/budget`
//   .addSuccess(Budget)

// // PUT /projects/:projectId/budget     (create or replace)
// export const upsertBudget = HttpApiEndpoint.put("upsertBudget")`/projects/${projectIdParam}/budget`
//   .setPayload(Budget)
//   .addSuccess(Budget)

// // PATCH /projects/:projectId/budget   (partial update)
// const PatchBudget = Schema.partial(Budget)
// export const patchBudget = HttpApiEndpoint.patch("patchBudget")`/projects/${projectIdParam}/budget`
//   .setPayload(PatchBudget)
//   .addSuccess(Budget)

// // DELETE /projects/:projectId/budget
// export const deleteBudget = HttpApiEndpoint.del("deleteBudget")`/projects/${projectIdParam}/budget`

// // Deliverable API Endpoints

// // GET /projects/:projectId/deliverables
// export const getDeliverables = HttpApiEndpoint.get("getDeliverables")`/projects/${projectIdParam}/deliverables`
//   .addSuccess(Schema.Array(Deliverable))

// // POST /projects/:projectId/deliverables
// export const newDeliverable = HttpApiEndpoint.post("addDeliverable")`/projects/${projectIdParam}/deliverables`
//   .setPayload(Deliverable)       // or CreateDeliverable (no id, id server-generated)
//   .addSuccess(Deliverable)

// // GET /projects/:projectId/deliverables/:deliverableId
// export const getDeliverable = HttpApiEndpoint.get("getDeliverable")`/projects/${projectIdParam}/deliverables/${deliverableIdParam}`
//   .addSuccess(Deliverable)

// // PUT /projects/:projectId/deliverables/:deliverableId
// export const updateDeliverable = HttpApiEndpoint.put("updateDeliverable")`/projects/${projectIdParam}/deliverables/${deliverableIdParam}`
//   .setPayload(Deliverable)
//   .addSuccess(Deliverable)

// // PATCH /projects/:projectId/deliverables/:deliverableId
// const PatchDeliverable = Schema.partial(Deliverable)
// export const patchDeliverable = HttpApiEndpoint.patch("patchDeliverable")`/projects/${projectIdParam}/deliverables/${deliverableIdParam}`
//   .setPayload(PatchDeliverable)
//   .addSuccess(Deliverable)

// // DELETE /projects/:projectId/deliverables/:deliverableId
// export const deleteDeliverable = HttpApiEndpoint.del("deleteDeliverable")`/projects/${projectIdParam}/deliverables/${deliverableIdParam}`

export const SearchApi = HttpApiGroup.make("SearchApi")
    .add(search)
    .middleware(Authorization)

export const ProjectsApi = HttpApiGroup.make("ProjectsApi")
    // project
    .add(getProjects)
    .add(newProject)
//  .add(getProject)
//  .add(updateProject)
//  .add(patchProject)
//  .add(deleteProject)
//   // budget
//   .add(getBudget)
//   .add(upsertBudget)
//   .add(patchBudget)
//   .add(deleteBudget)
//   // deliverables
//   .add(getDeliverables)
//   .add(newDeliverable)
//   .add(getDeliverable)
//   .add(updateDeliverable)
//   .add(patchDeliverable)
//   .add(deleteDeliverable)
    .middleware(Authorization)

    
export class DummyError extends Schema.TaggedErrorClass<DummyError>()("DummyError", {
    status: Schema.Number,
    reason: Schema.String
}) { }


//HttpApi.make("graphQL").add(
export const graphqlApi = HttpApiGroup.make("GraphQL").add(
        HttpApiEndpoint.post("graphql", "/graphql", {
            payload: Schema.Any,
            error: DummyError,
            success: Schema.Any
        })
    )



// export const GraphQLApi = HttpApiGroup.make("GraphQL")
//     .add(graphqlApi)
// //    .middleware(Authorization)


export const MyApi = HttpApi.make("Api")
    .add(SearchApi)
    .add(ProjectsApi)
    .add(AuthApi).prefix("/api")
    .add(graphqlApi)

export const AuthApiLive = Layer.unwrap(Effect.gen(function* () {
    return HttpApiBuilder.group(MyApi, "AuthApi", (handlers) =>
        handlers
        .handle("auth", ({ payload }) => genToken(payload))
    )
}))
      
 
const searchImpl = ({ params }: { params: ProjectListQuery }) =>
            Effect.gen(function* () {
                const { search, fields, limit, offset, continuationToken } = params

                const currentUser = (yield* User).currentUser();
                yield* Effect.annotateCurrentSpan("currentUser.userId", currentUser.userId)
                yield* Effect.annotateCurrentSpan("currentUser.roles", currentUser.roles)
                if (continuationToken != null && (limit != null || offset != null)) {
                    //   return yield* Effect.fail(
                    //     new Error("Use either limit+offset or continuationToken, not both")
                    //   )
                }

                const pagination =
                    continuationToken != null
                        ? { kind: "token" as const, continuationToken }
                        : limit != null || offset != null
                            ? { kind: "offset" as const, limit: limit ?? 50, offset: offset ?? 0 }
                            : { kind: "none" as const }

                // use `pagination` downstream
                const results: Array<number> = [] 
                //yield* (repo.search(urlParams.search ?? "").pipe(
                 //   Effect.provide(SecurityPredicate.Default(currentUser)),
                 //   Effect.mapError((err) => err.message)
                //))
                return results
            })
            
export const SearchApiLive = Layer.unwrap(Effect.gen(function* () {

    return HttpApiBuilder.group(MyApi, "SearchApi", (handlers) =>
        handlers
        .handle("search", searchImpl))
}))

export const ProjectsApiLive = Layer.unwrap(Effect.gen(function* () {
    //const repo = yield* ProjectRepository
    return HttpApiBuilder.group(MyApi, "ProjectsApi", (handlers) =>
        handlers
        .handle("getProjects", ({ params }) =>
            Effect.gen(function* () {
                const { search, fields, limit, offset, continuationToken } = params

                if (continuationToken != null && (limit != null || offset != null)) {
                    //   return yield* Effect.fail(
                    //     new Error("Use either limit+offset or continuationToken, not both")
                    //   )
                }

                const pagination =
                    continuationToken != null
                        ? { kind: "token" as const, continuationToken }
                        : limit != null || offset != null
                            ? { kind: "offset" as const, limit: limit ?? 50, offset: offset ?? 0 }
                            : { kind: "none" as const }

                // use `pagination` downstream
                // ...
                return []
            })
        )
        .handle("createProject", ({ payload }) =>
            Effect.gen(function* () {
                const currentUser = (yield* User).currentUser();
//                yield* repo.upsert({...payload, ProjectId: payload.id, owner: currentUser.userId}).pipe(
//                    Effect.tapError((e) => Effect.logError(`Error creating project: ${e.message}`)),
//                    Effect.orDie)
                return yield* Effect.succeed(payload)
            }
        ))
        //   handlers.handle("getProjects", () => Effect.succeed([]))
    )
}))
// export const ProjectsGroupLive = HttpApiBuilder.group(
//   ProjectApi,
//   "ProjectApi", // same identifier passed to HttpApiGroup.make
//   (handlers) =>
//     handlers
//       // GET /projects
//       .handle("getProjects", () =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) => ref.get),
//           Effect.map((map) =>
//             Array.from(map.values()).map(toProject)
//           )
//         )
//       )

//       // POST /projects
//       .handle("createProject", ({ payload }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const id = mkId("project") as ProjectId.Type
//               const record: ProjectRecord = {
//                 id,
//                 project: payload,
//                 deliverables: []
//               }
//               const next = new Map(map)
//               next.set(id, record)
//               return [record, next] as const
//             })
//           ),
//           Effect.map(toProject)
//         )
//       )

//       // GET /projects/:projectId
//       .handle("getProject", ({ path }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.get.pipe(
//               Effect.flatMap((map) =>
//                 map.get(path.projectId)
//                   ? Effect.succeed(map.get(path.projectId)!)
//                   : Effect.fail(new Error("Project not found"))
//               )
//             )
//           ),
//           Effect.map(toProject)
//         )
//       )

//       // PUT /projects/:projectId
//       .handle("updateProject", ({ path, payload }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const current =
//                 map.get(path.projectId) ??
//                 ({
//                   id: path.projectId,
//                   project: payload,
//                   deliverables: []
//                 } as ProjectRecord)

//               const updated: ProjectRecord = {
//                 ...current,
//                 project: payload
//               }

//               const next = new Map(map)
//               next.set(path.projectId, updated)
//               return [updated, next] as const
//             })
//           ),
//           Effect.map(toProject)
//         )
//       )

//       // PUT /projects/:projectId/budget
//       .handle("upsertBudget", ({ path, payload }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const current = map.get(path.projectId)
//               if (!current) {
//                 throw new Error("Project not found")
//               }
//               const updated: ProjectRecord = {
//                 ...current,
//                 budget: payload
//               }
//               const next = new Map(map)
//               next.set(path.projectId, updated)
//               return [payload, next] as const
//             })
//           )
//         )
//       )

//       // GET /projects/:projectId/budget
//       .handle("getBudget", ({ path }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.get.pipe(
//               Effect.flatMap((map) => {
//                 const project = map.get(path.projectId)
//                 if (!project || !project.budget) {
//                   return Effect.fail(new Error("Budget not found"))
//                 }
//                 return Effect.succeed(project.budget)
//               })
//             )
//           )
//         )
//       )

//       // DELETE /projects/:projectId/budget
//       .handle("deleteBudget", ({ path }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const current = map.get(path.projectId)
//               if (!current) {
//                 throw new Error("Project not found")
//               }
//               const updated: ProjectRecord = {
//                 ...current,
//                 budget: undefined
//               }
//               const next = new Map(map)
//               next.set(path.projectId, updated)
//               return [undefined, next] as const
//             })
//           )
//         )
//       )

//       // GET /projects/:projectId/deliverables
//       .handle("getDeliverables", ({ path }) =>
//         findProjectOrFail(path.projectId).pipe(
//           Effect.map((record) => record.deliverables)
//         )
//       )

//       // POST /projects/:projectId/deliverables
//       .handle("addDeliverable", ({ path, payload }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const current = map.get(path.projectId)
//               if (!current) {
//                 throw new Error("Project not found")
//               }
//               const id =
//                 (payload.id ??
//                   (mkId("deliv") as DeliverableId.Type))
//               const deliverable: Deliverable.Type = {
//                 ...payload,
//                 id
//               }
//               const updated: ProjectRecord = {
//                 ...current,
//                 deliverables: [...current.deliverables, deliverable]
//               }
//               const next = new Map(map)
//               next.set(path.projectId, updated)
//               return [deliverable, next] as const
//             })
//           )
//         )
//       )

//       // GET /projects/:projectId/deliverables/:deliverableId
//       .handle("getDeliverable", ({ path }) =>
//         findProjectOrFail(path.projectId).pipe(
//           Effect.flatMap((record) => {
//             const d = record.deliverables.find(
//               (x) => x.id === path.deliverableId
//             )
//             return d
//               ? Effect.succeed(d)
//               : Effect.fail(new Error("Deliverable not found"))
//           })
//         )
//       )

//       // PUT /projects/:projectId/deliverables/:deliverableId
//       .handle("updateDeliverable", ({ path, payload }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const current = map.get(path.projectId)
//               if (!current) {
//                 throw new Error("Project not found")
//               }
//               const idx = current.deliverables.findIndex(
//                 (d) => d.id === path.deliverableId
//               )
//               if (idx === -1) {
//                 throw new Error("Deliverable not found")
//               }
//               const updatedDeliverable: Deliverable.Type = {
//                 ...payload,
//                 id: path.deliverableId
//               }
//               const updated: ProjectRecord = {
//                 ...current,
//                 deliverables: current.deliverables.with(idx, updatedDeliverable)
//               }
//               const next = new Map(map)
//               next.set(path.projectId, updated)
//               return [updatedDeliverable, next] as const
//             })
//           )
//         )
//       )

//       // DELETE /projects/:projectId/deliverables/:deliverableId
//       .handle("deleteDeliverable", ({ path }) =>
//         FakeStore.pipe(
//           Effect.flatMap((ref) =>
//             ref.modify((map) => {
//               const current = map.get(path.projectId)
//               if (!current) {
//                 throw new Error("Project not found")
//               }
//               const filtered = current.deliverables.filter(
//                 (d) => d.id !== path.deliverableId
//               )
//               const updated: ProjectRecord = {
//                 ...current,
//                 deliverables: filtered
//               }
//               const next = new Map(map)
//               next.set(path.projectId, updated)
//               return [undefined, next] as const
//             })
//           )
//         )
//       )
// )
