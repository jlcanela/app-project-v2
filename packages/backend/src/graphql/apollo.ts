import { createClient } from "@libsql/client";
import { buildSchema } from 'drizzle-graphql';
import { drizzle } from 'drizzle-orm/libsql';
import { ApolloServer, HeaderMap, HTTPGraphQLRequest } from '@apollo/server';
import type { HTTPGraphQLResponse } from '@apollo/server'
import { printSchema } from "graphql";
import { readFileSync, writeFileSync } from "node:fs";
import * as dbSchema from '../db/schema.js';
import { HttpApiBuilder, HttpApiEndpoint, HttpApiGroup } from 'effect/unstable/httpapi';
import { Effect, Layer, Schema, ServiceMap } from 'effect';
import { HttpServerResponse } from "effect/unstable/http";
import { DummyError, MyApi } from "../API.js";
import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";

const sampleProject = {
    name: 'Project Validation',
    description: 'Validate the project and issue the error if it fails',
    schemaIn: JSON.stringify([{
        "path": "name",
        "label": "name",
        "type": "string",
        "required": true,
        "description": "name"
    },
    {
        "path": "budget",
        "label": "budget",
        "type": "integer",
        "required": true,
        "description": "budget"
    },
    {
        "path": "cost",
        "label": "cost",
        "type": "integer",
        "required": true,
        "description": "cost"
    }
    ]),
    schemaOut: JSON.stringify([{
        "path": "issue.code",
        "label": "code",
        "type": "string",
        "required": true,
        "description": "Issue identifier such as BUDGET_LIMIT_EXCEEDED or MARGIN_TO_LOW"
    },
    {
        "path": "issue.value",
        "label": "value",
        "type": ["number", "string"],
        "required": true,
        "description": "Actual value that triggered the issue (e.g. project.budget or computed margin)"
    },
    {
        "path": "issue.parameter",
        "label": "parameter",
        "type": ["number", "string"],
        "required": true,
        "description": "Threshold or parameter used in the rule (e.g. 10000 or 0.10)"
    }
    ]),
};

export class ApolloService extends ServiceMap.Service<ApolloService>()("ApolloService", {
    make: Effect.gen(function* () {
        const content = readFileSync('rules/project_validation_19.json').toString()
        const client = createClient({
            url: DEFAULT_DB_FILENAME, // file will be created if it doesn't exist
        });
        const db = drizzle(client, { schema: dbSchema, logger: true });
        const { schema } = buildSchema(db);

        if (process.env.INSERT_DB_DATA === "true") {

            const rt: typeof dbSchema.ruleTypes.$inferInsert = sampleProject

            yield* Effect.tryPromise(() => db.insert(dbSchema.ruleTypes).values(rt))

            const rule: typeof dbSchema.ruleInstances.$inferInsert = {
                name: 'Project Validation Rule',
                description: 'Verify if the project is valid',
                content,
                ruleTypeId: rt.ruleTypeId
            }
            yield* Effect.tryPromise(() => db.insert(dbSchema.ruleInstances).values(rule))

        }

        writeFileSync("../frontend/src/graphql/schema.graphql", printSchema(schema))

        const apolloServer = yield* Effect.acquireRelease(
            Effect.tryPromise(() => {
                const apolloServer = new ApolloServer({ schema });
                return apolloServer.start().then(() => apolloServer)
            }),
            (apolloServer) => Effect.tryPromise(() => apolloServer.stop()).pipe(Effect.catch(() => Effect.void))
        );

        const executeApollo = (httpGraphQLRequest: HTTPGraphQLRequest) => Effect.tryPromise({
            try: () => apolloServer.executeHTTPGraphQLRequest({
                httpGraphQLRequest,
                context: async () => ({})
            }) as Promise<HTTPGraphQLResponse>,
            catch: () => new DummyError({ status: 500, reason: "apolloServer execute failed" })
        })

        const execute = Effect.fn("Graphql.execute")(function* (httpGraphQLRequest: HTTPGraphQLRequest) {
            const response = yield* executeApollo(httpGraphQLRequest)
            if (response.status !== undefined && response.status !== 200) {
                yield* Effect.log(response)
                if (response.body) {
                    yield* Effect.annotateCurrentSpan("response.body", response.body)
                }
                return yield* Effect.fail(new DummyError({ status: response.status ?? 500, reason: "invalid apollo response" }))
            }
            if (response.body.kind !== "complete") {
                return yield* Effect.fail(new DummyError({ status: 500, reason: "invalid apollo response type" }))
            }
            return JSON.parse(response.body.string)
        })


        return {
            execute
        }
    })
}) {
    static layer = Layer.effect(this, this.make)

}

const DEFAULT_DB_FILENAME = "file:local.db";

export const graphqlApi1 = HttpApiGroup.make("GraphQL").add(
    HttpApiEndpoint.post("graphql", "/graphql", {
        payload: Schema.Any,
        error: DummyError,
        success: Schema.Any
    })
)

const graphQLHandler = ({ payload, request }: {
  payload: unknown
  request: HttpServerRequest
}) => Effect.gen(function* () {
    const body = yield* request.json //.toJSON //.json.pipe(Effect.catch(() => Effect.fail(new DummyError({ status: 500, reason: "invalid input" }))))

    const headers = new HeaderMap();
    for (const [key, value] of Object.entries(request.headers)) {
        if (value !== undefined) headers.set(key, value as string);
    }

    const httpGraphQLRequest = {
        body,
        headers,
        method: request.method,
        search: new URL(request.url, "http://localhost:3000").search,
    }

    const service = yield* ApolloService
    const result = yield* service.execute(httpGraphQLRequest)
    yield* Effect.log(result)
    return yield* HttpServerResponse.json(result).pipe(Effect.catch(() => Effect.fail(new DummyError({ status: 500, reason: "invalid internal response" }))))////.empty({ status: 500 });
}).pipe(
    Effect.catch((e) => Effect.die(e.toString()))
)

export const GraphqlLive = HttpApiBuilder.group(MyApi, "GraphQL", (handlers) =>
    handlers.handle("graphql", graphQLHandler)
).pipe(Layer.provide(ApolloService.layer))

