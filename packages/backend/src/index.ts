import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSwagger,
} from "effect/unstable/httpapi"
import {
  HttpRouter,
} from "effect/unstable/http"
import { FetchHttpClient, HttpBody, HttpClient } from 'effect/unstable/http';
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"
import { AuthApiLive, MyApi, ProjectsApiLive, SearchApiLive } from "./API.js"
import { Security } from "./lib/security.js"
import { AuthorizationLive } from "./lib/authorization.js"
import { WebAppRoutes } from "./WebApp.js"
import { GraphqlLive } from "./graphql/apollo.js"
import { Otlp, OtlpSerialization } from 'effect/unstable/observability';
import * as cfg from "./Services/PipelineConfig.js"
// const baseUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://localhost:4318";

const Observability = Otlp.layer({
  baseUrl: "http://localhost:4318",   // OTLP HTTP endpoint of your collector
  resource: {
    serviceName: "rule-studio-backend"         // service.name attribute
  },
}).pipe(
  Layer.provide(FetchHttpClient.layer),
  Layer.provide(OtlpSerialization.layerJson)
)

// const envProvider = ConfigProvider.fromEnv({ pathDelim: "__", seqDelim: "|" })

//const CustomApis = pipelinesToRouter([Pipelines[2]])
const portEnv = process.env.PORT;
const port = Number.isInteger(Number(portEnv)) && Number(portEnv) > 0 ? Number(portEnv) : 3000;
const Server = NodeHttpServer.layer(createServer, { port })

const MyApiLive = HttpApiBuilder.layer(MyApi).pipe(
  Layer.provide(SearchApiLive),
  Layer.provide(ProjectsApiLive),
  Layer.provide(AuthApiLive),
  Layer.provide(WebAppRoutes),
  Layer.provide(GraphqlLive),
  Layer.provide(HttpApiSwagger.layer(MyApi)),
  Layer.provide(AuthorizationLive),
  Layer.provide(Security.layer),
  Layer.provide(Observability),
  HttpRouter.serve,
  Layer.provide(Server)
)

// Layer.provide(Observability),
//Layer.provide(CustomApis)
//.pipe(
//Layer.provide(BusinessRuleService.layer),
// Layer.provide(RequestDispatcher.layer)
// ))
//HttpServer.withLogAddress,

Layer.launch(MyApiLive).pipe(NodeRuntime.runMain)
