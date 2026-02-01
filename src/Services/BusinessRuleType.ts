import { Schema, Request, RequestResolver, Effect, Exit } from "effect"
import { GetProjectRequestError, ProjectForm, ProjectRequest } from "../Repository/ProjectRequestRepository.js"
import { ProjectRequestStatus, ProjectValidStatus } from "../Domain/Project.js"

// =============================================================================
// 1. Developer Definitions: The Building Blocks
// =============================================================================

/**
 * Represents the source of an event that triggers a workflow.
 * The Runtime uses this to set up Fastify routes or Event Bus subscriptions.
 */
export class HttpTrigger extends Schema.TaggedClass<HttpTrigger>()("HttpTrigger", {
    type: Schema.Literal("http"),
    method: Schema.Literal("POST", "GET", "PUT", "DELETE"),
    path: Schema.String,
    payloadSchema: Schema.Any
}) {}

export class EventBusTrigger extends Schema.TaggedClass<EventBusTrigger>()("EventBusTrigger", {
    type: Schema.Literal("event_bus"),
    channel: Schema.String,
    payloadSchema: Schema.Any,
    filter: Schema.optional(Schema.Any)
}) {}

export const TriggerDefinition = Schema.Union(HttpTrigger, EventBusTrigger)
export type TriggerDefinition = Schema.Schema.Type<typeof TriggerDefinition>

/**
 * The "What": Defines the core logic to be executed.
 * This is pure "In => Out" logic, decoupled from the Pipeline Context.
 */
export class RuleOperation extends Schema.TaggedClass<RuleOperation>()("RuleOperation", {
    type: Schema.Literal("Rule"),
    ruleName: Schema.String,
    ruleFile: Schema.String,
    inputSchema: Schema.Any,
    outputSchema: Schema.Any
}) {}

export class RequestOperation extends Schema.TaggedClass<RequestOperation>()("RequestOperation", {
    type: Schema.Literal("Request"),
    request: Schema.Any
}) {}

export const StepOperation = Schema.Union(RuleOperation, RequestOperation)
export type StepOperation = Schema.Schema.Type<typeof StepOperation>

/**
 * The "How": Adapts the Operation to the Pipeline Context.
 * Handles Context => Input and (Context, Output) => Context transformations.
 */
export class PipelineStep extends Schema.Class<PipelineStep>("PipelineStep")({
    name: Schema.String,
    operation: StepOperation,
    inputAdapter: Schema.Any, // (context) => operationInput
    outputAdapter: Schema.optional(Schema.Any), // (context, operationOutput) => newContext
    condition: Schema.optional(Schema.Any)
}) {}

/**
 * A Pipeline consists of a Trigger and a sequence of Steps.
 */
export class PipelineDefinition extends Schema.Class<PipelineDefinition>("PipelineDefinition")({
    id: Schema.String,
    trigger: TriggerDefinition,
    steps: Schema.Array(PipelineStep)
}) {}

// =============================================================================
// 3. Implementation Examples (The "Enhanced" Concept)
// =============================================================================

// --- Phase 1: Ingress & Validation (HTTP -> Event) ---

interface PublishEvent extends Request.Request<void, never> {
  readonly _tag: "PublishEvent"
  readonly channel: string
  readonly payload: unknown
}
const PublishEvent = Request.tagged<PublishEvent>("PublishEvent")

export const validationPipeline = new PipelineDefinition({
    id: "project-validation-pipeline",
    trigger: new HttpTrigger({
        type: "http",
        method: "POST",
        path: "/project-request/status",
        payloadSchema: ProjectRequest
    }),
    steps: [
        new PipelineStep({
            name: "validateProject",
            operation: new RuleOperation({
                type: "Rule",
                ruleName: "validateProject",
                ruleFile: "validate_project.json",
                inputSchema: ProjectRequest,
                outputSchema: ProjectRequestStatus
            }),
            inputAdapter: (ctx: any) => ctx,
            outputAdapter: (ctx: any, out: any) => ({ ...ctx, status: out })
        }),
        new PipelineStep({
            name: "publishValidation",
            operation: new RequestOperation({
                type: "Request",
                request: PublishEvent
            }),
            inputAdapter: (ctx: any) => ({
                channel: "project.validation.events",
                payload: ctx.status
            })
        })
    ]
})

// --- Phase 2: Creation (Event -> Persistence) ---

interface GetProjectRequestById extends Request.Request<ProjectRequest, GetProjectRequestError> {
  readonly _tag: "GetProjectRequestById"
  readonly id: number
}

const GetProjectRequestById = Request.tagged<GetProjectRequestById>("GetProjectRequestById")

interface CreateProject extends Request.Request<CreateProject, GetProjectRequestError> {
  readonly _tag: "CreateProject"
  readonly projectForm: ProjectForm
}

const CreateProject = Request.tagged<CreateProject>("CreateProject")

export const creationPipeline = new PipelineDefinition({
    id: "project-creation-pipeline",
    trigger: new EventBusTrigger({
        type: "event_bus",
        channel: "project.validation.events",
        payloadSchema: ProjectRequestStatus,
        // KEY ENHANCEMENT: Only trigger this workflow if the status is Valid
        filter: Schema.is(ProjectValidStatus)
    }),
    steps: [
        new PipelineStep({
            name: "fetchProjectRequest",
            operation: new RequestOperation({
                type: "Request",
                request: GetProjectRequestById
            }),
            inputAdapter: (ctx: any) => ({ id: ctx.id }),
            outputAdapter: (ctx: any, out: any) => ({ ...ctx, project: out })
        }),
        new PipelineStep({
            name: "prepareProject",
            operation: new RuleOperation({
                type: "Rule",
                ruleName: "prepareProject",
                ruleFile: "prepare_project_creation.json",
                inputSchema: Schema.Struct({ project: ProjectRequest }),
                outputSchema: ProjectForm
            }),
            inputAdapter: (ctx: any) => ({ project: ctx.project }),
            outputAdapter: (ctx: any, out: any) => ({ ...ctx, form: out })
        }),
        new PipelineStep({
            name: "createProjectEntity",
            operation: new RequestOperation({
                type: "Request",
                request: CreateProject
            }),
            inputAdapter: (ctx: any) => ({ projectForm: ctx.form })
        })
    ]
})

export interface DumpLog extends Request.Request<number, never> {
  readonly _tag: "DumpLog"
  readonly projectForm: ProjectForm
}

export const DumpLog = Request.tagged<DumpLog>("DumpLog")

export const DumpLogResolver = RequestResolver.fromEffect(
    (_: DumpLog) =>
    Effect.gen(function* () {
        yield* Effect.log(`[DumpLogResolver] executing ...`)
        return 0
    })
)

export const dummyPipeline = new PipelineDefinition({
    id: "dummy-pipeline",
    trigger: new HttpTrigger({
        type: "http",
        method: "POST",
        path: "/status",
        payloadSchema: ProjectRequest
    }),
    steps: [
        new PipelineStep({
            name: "dumpLog",
            operation: new RequestOperation({
                type: "Request",
                request: DumpLog
            }),
            inputAdapter: (ctx: any) => ({ projectForm: ctx.form })
        }),
        new PipelineStep({
            name: "validateProject",
            operation: new RuleOperation({
                type: "Rule",
                ruleName: "validateProject",
                ruleFile: "validate_project.json",
                inputSchema: ProjectRequest,
                outputSchema: ProjectRequestStatus
            }),
            inputAdapter: (ctx: any) => ({ project: ctx}),
            outputAdapter: (_: any, out: any) => ({...out })
        }),
    ]
})

// =============================================================================
// 4. Runtime Registry
// =============================================================================

export const Pipelines = [
    validationPipeline,
    creationPipeline,
    dummyPipeline
]
