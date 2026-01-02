import {
  HttpApiBuilder,
  HttpApiSwagger
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { ConfigProvider, Effect, Layer, Schema } from "effect"
import { createServer } from "node:http"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { Cosmos, layerCosmos } from "./DocumentDb/CosmosDb.js"
import { ProjectRepositoryLive } from "./Repository/Project.js"
import * as Document from "./DocumentDb/Document.js"
import { MyApi, ProjectsApiLive, SearchApiLive } from "./API.js"
//import { Repository } from "./Repository/Repository.js"

const baseUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const Observability = Otlp.layer({
  baseUrl,
  resource: {
    serviceName: "my-service"
  },
}).pipe(Layer.provide(FetchHttpClient.layer))

// const MyApi = HttpApi.make("MyApi")
// .add(projectsGroup)

// const hello = Effect.gen(function* () {

//   const repo = yield* ProjectRepository

//   const project: Project = {    
//       id: ProjectId.make(`${new Date().toISOString()}-PRJ-001`),
//      // _version: 1,
//       //ownerId: "PTY-1001",
//       name: "Project 1",
//       //description: "Sample project 1 for demonstration.",
//       //startDate: "2025-09-20",
//       //endDate: "2026-09-16",
//       //status: "Draft"
//       budget: {
//         amount: 100000
//       },
//       deliverables: []
    
//   }

//   //{} 
//   //yield* repo.upsertItem("partitionKey", "id", "value"); // Simulate some async work 

//   yield* repo.upsert(project)
//   //yield* repo.upsertItem("project_id", "entity", project.entity)

//   yield* Effect.log(`Inserted project with id: ${project.id}`)
//   const fetch = repo.getById(project.id).pipe(Effect.tapError(err => Effect.logError(`Error fetching project: ${err.message}`)));
//   const projectA = yield* repo.queryItems(project.id, undefined)
//   yield* Effect.log(`Queried projects: ${JSON.stringify(projectA)}`)
//   const fetchedProject = yield* Effect.exit(fetch) //fetch.pipe(Effect.failCause)
//   yield* Effect.log(`Fetched project: ${JSON.stringify(fetchedProject)}`)
//   //return JSON.stringify(fetchedProject, null, 2);
//   return "Hello, World!";
// })

// const hello2 = hello.pipe(
//   Effect.tap(result => Effect.log(`Hello World Result: ${result}`)),
//   Effect.tapError(err => Effect.logError(`Hello World Error: ${err.message}`)),
//   Effect.orDie
// )

// const GreetingsLive = Layer.unwrapEffect(Effect.gen(function* () {
//   //const cosmos = yield* Cosmos
//   return HttpApiBuilder.group(MyApi, "Greetings", (handlers) =>
//     handlers.handle("hello-world", () => hello2)
//   )
// }))

const envProvider = ConfigProvider.fromEnv({ pathDelim: "__", seqDelim: "|" })



const MyApiLive = HttpApiBuilder.api(MyApi).pipe(
  Layer.provide(Observability),
  Layer.provide(SearchApiLive),
  Layer.provide(ProjectsApiLive),
  Layer.provide(ProjectRepositoryLive),
  Layer.provide(Document.layerKV),
  Layer.provide(Cosmos.Default),
  Layer.provide(layerCosmos(envProvider))
)

const portEnv = process.env.PORT;
const port = Number.isInteger(Number(portEnv)) && Number(portEnv) > 0 ? Number(portEnv) : 3000;

const ServerLive = HttpApiBuilder.serve().pipe(
  // Provide the Swagger layer so clients can access auto-generated docs
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(MyApiLive),
  Layer.provide(NodeHttpServer.layer(createServer, { port }))
)

Layer.launch(ServerLive).pipe(NodeRuntime.runMain)
