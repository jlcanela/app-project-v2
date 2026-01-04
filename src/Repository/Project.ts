import { Schema } from "effect"
import { AggregateConfig, EntityConfig, makeRepositoryConfig } from "./Common.js"
import { Context, Effect, Layer } from "effect"
import { makeRepository, Repository } from "./Repository.js"

import type { AggregateRoot } from "./Common.js"
import { DocumentDb } from "../DocumentDb/Document.js"

// usage
export const projectAggregateConfig = new AggregateConfig<"Project", "ProjectId">({
  name: "Project",
  partitionKey: "ProjectId",
})

export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"))

export const Project = Schema.Struct({
  name: Schema.String
})

export const projectConfig = new EntityConfig<
  "project",
  typeof ProjectId,
  typeof Project,
  "root"
  //Schema.Schema<any, any, never>
>({
  name: "project",
  kind: "root",
  type: "project",
  idSchema: ProjectId,
  domainSchema: Project
})

export const Budget = Schema.Struct({
  amount: Schema.Number
})
export type Budget = typeof Budget.Type

export const budgetConfig = new EntityConfig<
  "budget",
  typeof ProjectId,
  typeof Budget,
  "single"
  //Schema.Schema<any, any, never>
>({
  name: "budget",
  kind: "single",
  type: "budget",
  idSchema: ProjectId,
  domainSchema: Budget
})

export const DeliverableId = Schema.String.pipe(Schema.brand("DeliverableId"))

export const Deliverable = Schema.Struct({
  id: DeliverableId,
  name: Schema.String
})

export const deliverablesConfig = new EntityConfig<
  "deliverables",
  typeof DeliverableId,
  typeof Deliverable,
  "collection"
  //Schema.Schema<any, any, never>
>({
  name: "deliverables",
  type: "deliverable",
  kind: "collection",
  idSchema: DeliverableId,
  domainSchema: Deliverable
})

export const projectRepositoryConfig = makeRepositoryConfig<
  "Project",
  "ProjectId",
  "project",
  never,
  typeof projectConfig,
  {}
>({
  aggregate: projectAggregateConfig,
  root: projectConfig,
  entities: {
    budget: budgetConfig,
    deliverables: deliverablesConfig,
  }
})

// The concrete Project aggregate root type
const aggregateSchema = projectRepositoryConfig.aggregateSchema()
export type Project = typeof aggregateSchema.Type

// Tag for the ProjectRepository service
export class ProjectRepository extends Context.Tag("ProjectRepository")<
  ProjectRepository,
  Repository<typeof projectRepositoryConfig>
>() {}

// Live implementation of the ProjectRepository service
export const ProjectRepositoryLive: Layer.Layer<ProjectRepository, never, DocumentDb> = Layer.effect(
  ProjectRepository,
  makeRepository(projectRepositoryConfig)
)
