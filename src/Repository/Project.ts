import { Schema } from "effect"
import { AggregateConfig, AggregateId, EntityConfig, makeRepositoryConfig } from "./Common.js"

// usage
export const projectAggregateConfig = new AggregateConfig<"Project", "ProjectId">({
  name: "Project",
  idSchema: "ProjectId",
})

//const DeliverableId = Schema.String.pipe(Schema.brand("DeliverableId"))
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
