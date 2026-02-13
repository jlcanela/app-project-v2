import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpServer
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { ConfigProvider, Effect, Layer, Schema } from "effect"
import { createServer } from "node:http"
import * as Otlp from "@effect/opentelemetry/Otlp"
import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import { AuthApiLive, MyApi, ProjectsApiLive, SearchApiLive } from "./API.js"
import { Security } from "./lib/security.js"
import { AuthorizationLive } from "./lib/authorization.js"
import { pipelinesToRouter, RequestDispatcher } from "./Services/PipelineInterpreter.js"
import { Pipelines } from "./Services/BusinessRuleType.js"
import { BusinessRuleService } from "./Services/BusinessRulesService.js"
//import { Repository } from "./Repository/Repository.js"
import { WebAppRoutes } from "./WebApp.js"

const baseUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const Observability = Otlp.layer({
  baseUrl,
  resource: {
    serviceName: "my-service"
  },
}).pipe(Layer.provide(FetchHttpClient.layer))

// const envProvider = ConfigProvider.fromEnv({ pathDelim: "__", seqDelim: "|" })

const CustomApis = pipelinesToRouter([Pipelines[2]])

const MyApiLive = HttpApiBuilder.api(MyApi).pipe(
  Layer.provide(Observability),
  Layer.provide(SearchApiLive),
  Layer.provide(ProjectsApiLive),
  Layer.provide(AuthApiLive),
  Layer.provide(WebAppRoutes),
  Layer.provide(CustomApis.pipe(
    Layer.provide(BusinessRuleService.Default),
    Layer.provide(RequestDispatcher.Default)
  ))
)

const portEnv = process.env.PORT;
const port = Number.isInteger(Number(portEnv)) && Number(portEnv) > 0 ? Number(portEnv) : 3000;

const ServerLive = HttpApiBuilder.serve().pipe(
  HttpServer.withLogAddress,
  // Provide the Swagger layer so clients can access auto-generated docs
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(MyApiLive),
  Layer.provide(AuthorizationLive),
  Layer.provide(Security.Default),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(NodeHttpServer.layer(createServer, { port }))
)

Layer.launch(ServerLive).pipe(NodeRuntime.runMain)
