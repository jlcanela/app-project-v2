import { HttpServerRequest, HttpServerResponse } from "effect/unstable/http"
import { Effect, Layer, Request, Schema, ServiceMap } from "effect"
import { BusinessRuleService } from "./BusinessRulesService.js"
import { DumpLog, DumpLogResolver, PipelineDefinition } from "./BusinessRuleType.js"
import { HttpRouter, PathInput } from "effect/unstable/http/HttpRouter"
import { RequestError } from "effect/unstable/http/HttpClientError"
import { HttpBodyError } from "effect/unstable/http/HttpBody"

// =============================================================================
// Service Definitions
// =============================================================================
export class PipelineError extends Schema.TaggedErrorClass<PipelineError>()("PipelineError", {
    message: Schema.String,
    step: Schema.optional(Schema.String),
    cause: Schema.optional(Schema.Unknown)
}) { }

export class DispatchError extends Schema.TaggedErrorClass<DispatchError>()("DispatchError", {
    message: Schema.String,
}) { }

/**
 * A service to dispatch generic Requests defined in the pipeline.
 * You would implement this by matching request tags to actual resolvers or services.
 */
export class RequestDispatcher extends ServiceMap.Service<RequestDispatcher>()("app/RequestDispatcher", {
    make: Effect.gen(function* () {
        return {
            dispatch: <A, E>(req: Request.Request<A, E>) => Effect.gen(function* () {
                const tag = (req as unknown as { _tag: string })._tag
                switch (tag) {
                    case "DumpLog": 
                        return yield* Effect.request(req as unknown as DumpLog, DumpLogResolver) as unknown as Effect.Effect<A, E, never>
                    default:
                        return Effect.fail(new DispatchError({ message: "Not implemented"})) as unknown as Effect.Effect<A, E, never>
                }
            })
        }
    })
}) { 
    static layer = Layer.effect(this, this.make)
}



// =============================================================================
// Interpreter Logic
// =============================================================================

/**
 * Executes a single pipeline with the given input.
 */
export const executePipeline = (
    pipeline: PipelineDefinition,
    initialInput: unknown
): Effect.Effect<unknown, PipelineError, BusinessRuleService | RequestDispatcher> => {
    return Effect.gen(function* () {

        const businessRules = yield* BusinessRuleService
       // const businessRules = yield* Effect.serviceOption(BusinessRuleService)
        const requestDispatcher = yield* RequestDispatcher

        let context = initialInput

        for (const step of pipeline.steps) {
            // 1. Adapt Context -> Input
            const stepInput = step.inputAdapter(context)

            // 2. Execute Operation
            let stepOutput: unknown

            if (step.operation.type === "Rule") {
                const ruleOp = step.operation
                stepOutput = yield* businessRules.execute(ruleOp.ruleName, stepInput).pipe(
                    Effect.mapError(e => new PipelineError({
                        message: `Rule execution failed: ${ruleOp.ruleName} ${e}`,
                        step: step.name,
                        cause: e
                    }))
                )
            } else if (step.operation.type === "Request") {
                const reqOp = step.operation
                // Assuming reqOp.request is a constructor function for the Request
                const requestInstance = reqOp.request(stepInput)

                yield* Effect.log(`Dispatching request: ${requestInstance._tag}`)
                stepOutput = yield* requestDispatcher.dispatch(requestInstance).pipe(
                    Effect.tapError(e => Effect.log(`Request dispatch failed: ${e}`)),
                    Effect.mapError(e => new PipelineError({
                        message: `Request dispatch failed`,
                        step: step.name,
                        cause: e
                    }))
                )
            }

            // 3. Adapt Output -> Context (if adapter exists)
            if (step.outputAdapter) {
                context = step.outputAdapter(context, stepOutput)
            }
        }

        return context
    })
}

export const isPathInput = (s: string): s is PathInput =>
    s === "*" || s.startsWith("/")

/**
 * Transforms a list of PipelineDefinitions into an Http Router.
 * Only processes pipelines with 'http' triggers.
 */
export const pipelinesToRouter = (
    pipelines: Iterable<PipelineDefinition>
) =>  HttpRouter.use((router) => Effect.gen(function* () {
    const businessRules = yield* BusinessRuleService
     const requestDispatcher = yield* RequestDispatcher
     
    yield* router.add("GET", "/info", HttpServerResponse.json({ message: "Hello, World!"}))
        for (const pipeline of pipelines) {
            if (pipeline.trigger.type === "http") {
                const { method, path, payloadSchema } = pipeline.trigger
                if (!isPathInput(path)) {
                    continue
                }
                
                const handler = Effect.gen(function* () {
                    // 1. Parse Body
                    const req = yield* HttpServerRequest.HttpServerRequest
                    const body = yield* req.json
                    const input = yield* Schema.decodeUnknownEffect(payloadSchema)(body).pipe(
                        Effect.catch(e => HttpServerResponse.json({ message: "Validation Error", details: e }, { status: 400 }).pipe(
                            Effect.flatMap(Effect.fail)
                        ))
                    )
                    
                    // 2. Execute Pipeline
                    const result = yield* executePipeline(pipeline, input).pipe(
                        Effect.provideService(BusinessRuleService, businessRules),
                        Effect.provideService(RequestDispatcher, requestDispatcher),
                        Effect.catch(e => HttpServerResponse.json({ message: e.message }, { status: 500 }).pipe(
                            Effect.flatMap(Effect.fail)
                        )) 
                    )   

                    // 3. Return Result
                    return yield* HttpServerResponse.json(result)
                }) as Effect.Effect<HttpServerResponse.HttpServerResponse, RequestError | HttpServerResponse.HttpServerResponse | HttpBodyError, never>
                
                yield* Effect.log(`Registering route ${method} ${path}`)

                // Map method string to Router function
                switch (method) {
                     case "GET": yield* router.add("GET", path, handler);break;
                     case "POST": yield* router.add("POST", path, handler); break;
                     case "PUT": yield* router.add("PUT", path, handler); break;
                     case "DELETE": yield* router.add("DELETE", path, handler); break;
                 }
            }
        }
    }))
