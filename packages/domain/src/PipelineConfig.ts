import { Schema } from "effect"

// =============================================================================
// 1. Shared Enums & Primitives
// =============================================================================

/** Identifier referencing a registered request resolver by tag name. */
export const RequestTag = Schema.String

/** Identifier referencing a rule instance stored in the database. */
export const RuleName = Schema.String

/** Identifier referencing a rule type stored in the database. */
export const RuleTypeRef = Schema.String

export const HttpMethod = Schema.Literals(["POST", "GET", "PUT", "DELETE"])
export type HttpMethod = typeof HttpMethod.Type

// =============================================================================
// 2. Declarative Field Mapping
// =============================================================================

/**
 * A single field mapping: reads a value from `source` path and writes it to
 * `target` path. Supports dotted paths (e.g. "project.budget").
 *
 * Optional `defaultValue` is used when the source path resolves to undefined.
 */
export class FieldMapping extends Schema.Class<FieldMapping>("FieldMapping")({
    source: Schema.String,
    target: Schema.String,
    defaultValue: Schema.optional(Schema.Unknown)
}) {}

/**
 * A declarative, serializable adapter replacing arbitrary functions.
 *
 * - `"passthrough"` — forwards the entire source object as-is
 * - `"fields"`      — maps individual fields via `FieldMapping[]`
 * - `"merge"`       — shallow-merges the operation output into the context
 */
export class PassthroughAdapter extends Schema.TaggedClass<PassthroughAdapter>()("PassthroughAdapter", {
    kind: Schema.Literal("passthrough")
}) {}

export class FieldsAdapter extends Schema.TaggedClass<FieldsAdapter>()("FieldsAdapter", {
    kind: Schema.Literal("fields"),
    mappings: Schema.Array(FieldMapping)
}) {}

export class MergeAdapter extends Schema.TaggedClass<MergeAdapter>()("MergeAdapter", {
    kind: Schema.Literal("merge"),
    /** Optional target key — if set, output is nested under this key in context. */
    targetKey: Schema.optional(Schema.String)
}) {}

export const AdapterConfig = Schema.Union([PassthroughAdapter, FieldsAdapter, MergeAdapter])
export type AdapterConfig = typeof AdapterConfig.Type

// =============================================================================
// 3. Trigger Configuration (references predefined endpoints)
// =============================================================================

export class HttpTriggerConfig extends Schema.TaggedClass<HttpTriggerConfig>()("HttpTriggerConfig", {
    type: Schema.Literal("http"),
    method: HttpMethod,
    path: Schema.String,
    /** Name of a schema (rule type schemaIn) to validate the incoming payload. */
    payloadSchemaRef: Schema.optional(RuleTypeRef)
}) {}

export class EventBusTriggerConfig extends Schema.TaggedClass<EventBusTriggerConfig>()("EventBusTriggerConfig", {
    type: Schema.Literal("event_bus"),
    channel: Schema.String,
    /** Name of a schema to validate the incoming event payload. */
    payloadSchemaRef: Schema.optional(RuleTypeRef),
    /** Optional filter expression — only trigger when this evaluates to true. */
    filterExpression: Schema.optional(Schema.String)
}) {}

export const TriggerConfig = Schema.Union([HttpTriggerConfig, EventBusTriggerConfig])
export type TriggerConfig = typeof TriggerConfig.Type

// =============================================================================
// 4. Step Operation Configuration
// =============================================================================

export class RuleOperationConfig extends Schema.TaggedClass<RuleOperationConfig>()("RuleOperationConfig", {
    type: Schema.Literal("Rule"),
    /** References a rule instance name in the database. */
    ruleName: RuleName,
    /** References the rule type (for schema validation context). */
    ruleTypeRef: Schema.optional(RuleTypeRef),
}) {}

export class RequestOperationConfig extends Schema.TaggedClass<RequestOperationConfig>()("RequestOperationConfig", {
    type: Schema.Literal("Request"),
    /** Tag of the registered request resolver. */
    requestTag: RequestTag
}) {}

export const StepOperationConfig = Schema.Union([RuleOperationConfig, RequestOperationConfig])
export type StepOperationConfig = typeof StepOperationConfig.Type

// =============================================================================
// 5. Pipeline Step Configuration
// =============================================================================

export class ConditionConfig extends Schema.Class<ConditionConfig>("ConditionConfig")({
    /** Dotted path in context to evaluate. */
    field: Schema.String,
    /** Comparison operator. */
    operator: Schema.Literals(["eq", "neq", "exists", "not_exists", "gt", "lt", "gte", "lte", "in"]),
    /** Value to compare against (ignored for exists/not_exists). */
    value: Schema.optional(Schema.Unknown)
}) {}

export class PipelineStepConfig extends Schema.Class<PipelineStepConfig>("PipelineStepConfig")({
    /** Human-readable step name. */
    name: Schema.String,
    /** What this step executes. */
    operation: StepOperationConfig,
    /** How to build the operation input from the context. */
    inputAdapter: AdapterConfig,
    /** How to merge the operation output back into the context. */
    outputAdapter: Schema.optional(AdapterConfig),
    /** Optional guard — step is skipped when condition evaluates to false. */
    condition: Schema.optional(ConditionConfig),
    /** Step description for documentation / admin UI. */
    description: Schema.optional(Schema.String)
}) {}

// =============================================================================
// 6. Pipeline Definition Configuration (top-level, storable in DB)
// =============================================================================

export class PipelineConfig extends Schema.Class<PipelineConfig>("PipelineConfig")({
    /** Unique pipeline identifier (used as DB primary key). */
    id: Schema.String,
    /** Human-readable pipeline name. */
    name: Schema.String,
    /** Pipeline description for documentation / admin UI. */
    description: Schema.optional(Schema.String),
    /** What triggers this pipeline. */
    trigger: TriggerConfig,
    /** Ordered sequence of steps. */
    steps: Schema.Array(PipelineStepConfig),
    /** Whether this pipeline is active. */
    enabled: Schema.optional(Schema.Boolean),
    /** Version for optimistic concurrency. */
    version: Schema.optional(Schema.Number)
}) {}

// =============================================================================
// 7. Example Configurations (serializable JSON)
// =============================================================================

/** Project Validation Pipeline — as it would be stored in the database. */
export const projectValidationPipelineConfig = new PipelineConfig({
    id: "project-validation-pipeline",
    name: "Project Validation",
    description: "Validates a project request against business rules and publishes the result",
    trigger: new HttpTriggerConfig({
        type: "http",
        method: "POST",
        path: "/project-request/status",
        payloadSchemaRef: "ProjectRequest"
    }),
    steps: [
        new PipelineStepConfig({
            name: "validateProject",
            description: "Run GoRules validation on the project request",
            operation: new RuleOperationConfig({
                type: "Rule",
                ruleName: "validateProject",
                ruleTypeRef: "Project Validation"
            }),
            inputAdapter: new PassthroughAdapter({ kind: "passthrough" }),
            outputAdapter: new MergeAdapter({ kind: "merge", targetKey: "status" })
        }),
        new PipelineStepConfig({
            name: "publishValidation",
            description: "Publish validation result to the event bus",
            operation: new RequestOperationConfig({
                type: "Request",
                requestTag: "PublishEvent"
            }),
            inputAdapter: new FieldsAdapter({
                kind: "fields",
                mappings: [
                    new FieldMapping({ source: "status", target: "payload" })
                ]
            })
        })
    ]
})

/** Project Creation Pipeline — as it would be stored in the database. */
export const projectCreationPipelineConfig = new PipelineConfig({
    id: "project-creation-pipeline",
    name: "Project Creation",
    description: "Creates a project entity when validation succeeds",
    trigger: new EventBusTriggerConfig({
        type: "event_bus",
        channel: "project.validation.events",
        filterExpression: "_tag == 'ProjectValidStatus'"
    }),
    steps: [
        new PipelineStepConfig({
            name: "fetchProjectRequest",
            description: "Load the original project request from the database",
            operation: new RequestOperationConfig({
                type: "Request",
                requestTag: "GetProjectRequestById"
            }),
            inputAdapter: new FieldsAdapter({
                kind: "fields",
                mappings: [
                    new FieldMapping({ source: "id", target: "id" })
                ]
            }),
            outputAdapter: new MergeAdapter({ kind: "merge", targetKey: "project" })
        }),
        new PipelineStepConfig({
            name: "prepareProject",
            description: "Transform the request into a project creation form",
            operation: new RuleOperationConfig({
                type: "Rule",
                ruleName: "prepareProject",
                ruleTypeRef: "Project Preparation"
            }),
            inputAdapter: new FieldsAdapter({
                kind: "fields",
                mappings: [
                    new FieldMapping({ source: "project", target: "project" })
                ]
            }),
            outputAdapter: new MergeAdapter({ kind: "merge", targetKey: "form" })
        }),
        new PipelineStepConfig({
            name: "createProjectEntity",
            description: "Persist the new project entity",
            operation: new RequestOperationConfig({
                type: "Request",
                requestTag: "CreateProject"
            }),
            inputAdapter: new FieldsAdapter({
                kind: "fields",
                mappings: [
                    new FieldMapping({ source: "form", target: "projectForm" })
                ]
            }),
            condition: new ConditionConfig({
                field: "form",
                operator: "exists"
            })
        })
    ]
})
