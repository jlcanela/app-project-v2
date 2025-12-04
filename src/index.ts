import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSwagger
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Schema } from "effect"
import { createServer } from "node:http"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { Cosmos } from "./CosmosDb.js"
import { Project, Repository } from "./Repository.js"

const baseUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const Observability = Otlp.layer({
  baseUrl,
  resource: {
    serviceName: "my-service"
  },
}).pipe(Layer.provide(FetchHttpClient.layer))

const MyApi = HttpApi.make("MyApi").add(
  HttpApiGroup.make("Greetings").add(
    HttpApiEndpoint.get("hello-world")`/`.addSuccess(Schema.String)
  )
)

const hello = Effect.gen(function* () {

  const repo = yield* Repository

  const project: Project = {
    entity: {
      id: `${new Date().toISOString()}-PRJ-001`,
      _version: 1,
      ownerId: "PTY-1001",
      name: "Project 1",
      description: "Sample project 1 for demonstration.",
      startDate: "2025-09-20",
      endDate: "2026-09-16",
      status: "Draft"
    }
  }

  //yield* repo.upsertItem("partitionKey", "id", "value"); // Simulate some async work 

  yield* repo.upsertItem("project_id", "entity", project.entity)

  yield* Effect.log(`Inserted project with id: ${project.entity.id}`)
  const fetch = repo.getItem("id", "entity", project.entity.id).pipe(Effect.tapError(err => Effect.logError(`Error fetching project: ${err.message}`)));
  const fetchedProject = yield* Effect.exit(fetch) //fetch.pipe(Effect.failCause)
  yield* Effect.log(`Fetched project: ${JSON.stringify(fetchedProject)}`)
  //return JSON.stringify(fetchedProject, null, 2);
  return "Hello, World!";
})

const hello2 = hello.pipe(
  Effect.tap(result => Effect.log(`Hello World Result: ${result}`)),
  Effect.tapError(err => Effect.logError(`Hello World Error: ${err.message}`)),
  Effect.orDie
)

const GreetingsLive = Layer.unwrapEffect(Effect.gen(function* () {
  //const cosmos = yield* Cosmos
  return HttpApiBuilder.group(MyApi, "Greetings", (handlers) =>
    handlers.handle("hello-world", () => hello2)
  )
}))

const MyApiLive = HttpApiBuilder.api(MyApi).pipe(
  Layer.provide(Observability),
  Layer.provide(GreetingsLive),
  Layer.provide(Repository.Default),
  Layer.provide(Cosmos.Default)
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
