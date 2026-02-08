import { Schema } from "effect";

export const ProjectRequestForm = Schema.Struct({
    name: Schema.String,
    budget: Schema.Number,
    cost: Schema.Number
})
export type ProjectRequestForm = typeof ProjectRequestForm.Type

export const ProjectId = Schema.UUID.pipe(Schema.brand("ProjectId"))
export type ProjectId = typeof ProjectId.Type

export const ProjectRequest = Schema.Struct({
    id: ProjectId,
    name: Schema.String,
    budget: Schema.Number,
    cost: Schema.Number
})

export class ProjectValidStatus extends Schema.TaggedClass<ProjectValidStatus>()("ProjectValidStatus", {
}) {}

export const Issue = Schema.Struct({
  code: Schema.Literal("BUDGET_LIMIT_EXCEEDED", "MARGIN_TO_LOW", "COST_LIMIT_EXCEEDED"),
  parameter: Schema.Number,
  value: Schema.Number,
})
export type Issue = typeof Issue.Type

export const Issues = Schema.Array(Issue)
export type Issues = typeof Issues.Type

export class ProjectInvalidStatus extends Schema.TaggedClass<ProjectInvalidStatus>()("ProjectInvalidStatus", {
    issues: Issues
}) {}

export const ProjectRequestStatus = Schema.Union(
    ProjectValidStatus,
    ProjectInvalidStatus
)
export type ProjectRequestStatus = typeof ProjectRequestStatus.Type

export function isProjectInvalidStatus(
  s: ProjectRequestStatus,
): s is ProjectInvalidStatus {
  return s._tag === "ProjectInvalidStatus"
}

export const ProjectSummary = Schema.Struct({
    id: ProjectId,
    name: Schema.String,
    budget: Schema.Number,
    cost: Schema.Number,
})
export type ProjectSummary = typeof ProjectSummary.Type
