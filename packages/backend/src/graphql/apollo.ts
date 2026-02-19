import { createClient } from "@libsql/client";
import { buildSchema } from 'drizzle-graphql';
import { drizzle } from 'drizzle-orm/libsql';
import { ApolloServer, HeaderMap, HTTPGraphQLRequest } from '@apollo/server';
import type { HTTPGraphQLResponse } from '@apollo/server'
import { printSchema } from "graphql";
import { readFileSync, writeFileSync } from "node:fs";
import * as dbSchema from '../db/schema.js';
import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, HttpRouter, HttpServer, HttpServerRequest, HttpServerResponse } from '@effect/platform';
import { Context, Effect, Layer, Schema } from 'effect';

class DummyError extends Schema.TaggedError<DummyError>()("DummyError", {
    status: Schema.Number,
    reason: Schema.String
}) { }

const graphqlApi = HttpApi.make("graphQL").add(
    HttpApiGroup.make("group").add(
        HttpApiEndpoint.post("graphql", "/graphql")
            .setPayload(Schema.Any)
            .addError(DummyError)
            .addSuccess(Schema.Any)
    )
)

export class ApolloService extends Context.Tag("ApolloService")<
    ApolloService,
    {
        execute: (request: HTTPGraphQLRequest) => Effect.Effect<unknown, DummyError>
    }
>() { }

const DEFAULT_DB_FILENAME = "file:local.db";

export const ApolloServiceLive = Layer.scoped(
    ApolloService,
    Effect.gen(function* () {
        const client = createClient({
            url: DEFAULT_DB_FILENAME, // file will be created if it doesn't exist
        });
        const db = drizzle(client, { schema: dbSchema, logger: true });
        const { schema } = buildSchema(db);

        if (process.env.INSERT_DB_DATA === "true") {

            const rt: typeof dbSchema.ruleTypes.$inferInsert = {
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

            yield* Effect.tryPromise(() => db.insert(dbSchema.ruleTypes).values(rt))

            const content = readFileSync('rules/project_validation_19.json').toString()

            const rule: typeof dbSchema.ruleInstances.$inferInsert = {
                name: 'Project Validation Rule',
                description: 'Verify if the project is valid',
                content,
                ruleTypeId: rt.ruleTypeId
            }
            yield* Effect.tryPromise(() => db.insert(dbSchema.ruleInstances).values(rule))

        }
        
        writeFileSync("../frontend/src/graphql/schema.graphql", printSchema(schema))

        const apolloServer = new ApolloServer({ schema });

        yield* Effect.acquireRelease(
            Effect.tryPromise(() => apolloServer.start()),
            () => Effect.tryPromise(() => apolloServer.stop()).pipe(Effect.catchAll(() => Effect.void))
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

            console.log(new Date().toISOString())
            return JSON.parse(response.body.string)
        })
        return {
            execute: (httpGraphQLRequest: HTTPGraphQLRequest) => execute(httpGraphQLRequest).pipe(
                Effect.tapError((e) => Effect.log(e))
            )
        }
    }).pipe(
        Effect.tapError((e) => Effect.log(e))
    )
)

export const GraphqlLive = HttpApiBuilder.group(graphqlApi, "group", (handlers) =>
    handlers.handle("graphql", (req) => Effect.gen(function* () {
        const body = yield* req.request.json.pipe(Effect.catchAll(() => Effect.fail(new DummyError({ status: 500, reason: "invalid input" }))))

        const headers = new HeaderMap();
        for (const [key, value] of Object.entries(req.request.headers)) {
            if (value !== undefined) headers.set(key, value as string);
        }

        const httpGraphQLRequest = {
            body,
            headers,
            method: req.request.method,
            search: new URL(req.request.url, "http://localhost:3000").search,
        }

        const service = yield* ApolloService
        const result = yield* service.execute(httpGraphQLRequest)
        return yield* HttpServerResponse.json(result).pipe(Effect.catchAll(() => Effect.fail(new DummyError({ status: 500, reason: "invalid internal response" }))))////.empty({ status: 500 });
    })
    )
).pipe(Layer.provide(ApolloServiceLive))

