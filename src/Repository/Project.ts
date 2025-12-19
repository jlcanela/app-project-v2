import { Schema } from "effect"
import { AggregateConfig, EntityConfig, makeRepositoryConfig } from "./Common.js"
import { Context, Effect, Layer } from "effect"
import { makeRepository, Repository } from "./Repository.js"

import type { AggregateRoot } from "./Common.js"
import { DocumentDb } from "../DocumentDb/Document.js"

// usage
export const projectAggregateConfig = new AggregateConfig<"Project", "ProjectId">({
  name: "Project",
  idSchema: "ProjectId",
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
  path: "",
  idSchema: ProjectId,
  domainSchema: Project
})

const Budget = Schema.Struct({
  amount: Schema.Number
})

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
  path: "",
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
  path: "deliverables",
  idSchema: DeliverableId,
  domainSchema: Deliverable
})

export const projectRepositoryConfig = makeRepositoryConfig({
  aggregate: projectAggregateConfig,
  root: projectConfig,
  entities: {
    budget: budgetConfig,
    deliverables: deliverablesConfig,
  }
})

// The concrete Project aggregate root type
export type Project = AggregateRoot<typeof projectRepositoryConfig>

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
