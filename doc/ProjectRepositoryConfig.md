Below is a concrete, Effect‑Schema‑friendly configuration for your `Project` aggregate based on the full load example. It follows the conceptual model from the previous answer, but specialized to this aggregate.

***

## Aggregate configuration

```ts
import { Schema } from "effect"

// --- Domain models (schemas) ---

const ProjectId = Schema.String // "PRJ-101", etc.
const Version = Schema.Number

const ProjectStatus = Schema.Literal("Draft", "Active", "Completed", "Cancelled")

const ProjectProperties = Schema.Struct({
  ownerId: Schema.String,
  name: Schema.String,
  description: Schema.String,
  startDate: Schema.String,  // or DateFromString if you prefer
  endDate: Schema.String,
  status: ProjectStatus
})

const FinancialInfo = Schema.Struct({
  id: Schema.String,          // "FIN-PRJ-101"
  financialId: Schema.String  // "COD-5001"
})

const Budget = Schema.Struct({
  id: Schema.String,          // "PRJ-101"
  totalBudget: Schema.Number,
  currency: Schema.String
})

const Deliverable = Schema.Struct({
  id: Schema.String,          // "DEL-001"
  name: Schema.String
})

const Project = Schema.Struct({
  _tag: Schema.Literal("Project"),
  id: ProjectId,
  version: Version,
  properties: ProjectProperties,
  financialInfo: FinancialInfo,
  budget: Budget,
  deliverables: Schema.Array(Deliverable)
})

// --- AggregateConfig ---

const ProjectAggregateConfig = Schema.Struct({
  name: Schema.Literal("Project"),
  idSchema: ProjectId,
  versionSchema: Version,
  domainSchema: Project
})
```

Conceptually, this `AggregateConfig` says: “This repository handles `Project` aggregates with this id, version, and full shape.”

***

## Entity configuration

```ts
const ProjectEntityConfig = Schema.Record(Schema.String, Schema.Struct({
  name: Schema.String,
  kind: Schema.Union(
    Schema.Literal("single"),      // financialInfo, budget
    Schema.Literal("collection")   // deliverables
  ),
  path: Schema.String,             // path from root

  // child entity id type if applicable
  idSchema: Schema.optional(Schema.Schema), // left generic here, see below

  domainSchema: Schema.Schema,     // the entity schema
  persistenceSchema: Schema.optional(Schema.Schema),
  constraints: Schema.optional(Schema.Array(Schema.Unknown)) // placeholder for later
}))
```

Concrete instances for your `Project`:

```ts
const ProjectEntitiesConfig = {
  financialInfo: {
    name: "financialInfo",
    kind: "single",
    path: "financialInfo",
    idSchema: FinancialInfo.pipe(Schema.propertySignature("id").annotations({})),
    domainSchema: FinancialInfo
  },
  budget: {
    name: "budget",
    kind: "single",
    path: "budget",
    idSchema: Budget.pipe(Schema.propertySignature("id").annotations({})),
    domainSchema: Budget
  },
  deliverables: {
    name: "deliverables",
    kind: "collection",
    path: "deliverables",
    idSchema: Deliverable.pipe(Schema.propertySignature("id").annotations({})),
    domainSchema: Deliverable
  }
} as const
```

If you want stricter typing, you can parameterize `EntityConfig<A>` over the entity type and id type instead of using `Schema.Schema` as `unknown`.

***

## Selection (load) configuration

You mentioned:

- full aggregate
- subset by entity type
- GraphQL‑like selection

A simple configuration for those three:

```ts
const ProjectSelectionConfig = Schema.Struct({
  name: Schema.String,
  kind: Schema.Union(
    Schema.Literal("full"),
    Schema.Literal("root"),
    Schema.Literal("byEntityType"),
    Schema.Literal("structured")
  ),
  allowedEntities: Schema.optional(Schema.Array(Schema.String)),
  shape: Schema.optional(Schema.Struct({
    fields: Schema.Array(Schema.String),
    entities: Schema.optional(
      Schema.Record(
        Schema.String,
        Schema.Struct({
          included: Schema.Boolean,
          fields: Schema.optional(Schema.Array(Schema.String)),
          filterSchema: Schema.optional(Schema.Schema) // domain-specific filter type
        })
      )
    )
  }))
})

// concrete values

const ProjectSelections = [
  {
    name: "full",
    kind: "full" as const
  },
  {
    name: "rootOnly",
    kind: "root" as const
  },
  {
    // “by entity type”: here allowing financialInfo, budget, deliverables
    name: "byEntityType",
    kind: "byEntityType" as const,
    allowedEntities: ["financialInfo", "budget", "deliverables"]
  },
  {
    // GraphQL-like query: root props + deliverables with filters
    name: "projectWithDeliverables",
    kind: "structured" as const,
    shape: {
      fields: ["id", "version", "properties"],
      entities: {
        deliverables: {
          included: true,
          fields: ["id", "name"],
          // later you can plug an EntityFilter schema here
        }
      }
    }
  }
] as const
```

This gives you a typed registry of allowed selections that repository operations can refer to (e.g. `loadWithSelection("projectWithDeliverables", queryArgs)`).

***

## Update configuration

You listed:

- upsert full aggregate
- upsert entity / collection
- conditional single entity update
- conditional subset update

Define generic shapes:

```ts
const ProjectCondition = Schema.Unknown // replace with a real ADT later
const ProjectSubsetSelector = Schema.Unknown
const ProjectUpdateSpec = Schema.Unknown

const ProjectUpdateConfig = Schema.Struct({
  name: Schema.String,
  kind: Schema.Union(
    Schema.Literal("upsertAggregate"),
    Schema.Literal("upsertEntity"),
    Schema.Literal("upsertEntities"),
    Schema.Literal("conditionalEntityUpdate"),
    Schema.Literal("conditionalSubsetUpdate")
  ),
  target: Schema.optional(
    Schema.Struct({
      entityName: Schema.optional(Schema.String),
      subsetSelectorSchema: Schema.optional(Schema.Schema)
    })
  ),
  conditionSchema: Schema.optional(Schema.Schema),
  updateSchema: Schema.optional(Schema.Schema),
  concurrency: Schema.optional(
    Schema.Struct({
      strategy: Schema.Union(
        Schema.Literal("version"),
        Schema.Literal("etag"),
        Schema.Literal("none")
      ),
      versionFieldPath: Schema.optional(Schema.String)
    })
  )
})
```

Concrete `Project` update configs:

```ts
const ProjectUpdates = [
  {
    name: "upsertProject",
    kind: "upsertAggregate" as const,
    concurrency: {
      strategy: "version",
      versionFieldPath: "version"
    }
  },
  {
    name: "upsertDeliverable",
    kind: "upsertEntity" as const,
    target: { entityName: "deliverables" },
    concurrency: {
      strategy: "version",
      versionFieldPath: "version"
    }
  },
  {
    name: "conditionalDeliverableUpdate",
    kind: "conditionalEntityUpdate" as const,
    target: { entityName: "deliverables" },
    conditionSchema: ProjectCondition,
    updateSchema: ProjectUpdateSpec,
    concurrency: {
      strategy: "version",
      versionFieldPath: "version"
    }
  },
  {
    name: "conditionalSubsetUpdate",
    kind: "conditionalSubsetUpdate" as const,
    target: { subsetSelectorSchema: ProjectSubsetSelector },
    conditionSchema: ProjectCondition,
    updateSchema: ProjectUpdateSpec,
    concurrency: {
      strategy: "version",
      versionFieldPath: "version"
    }
  }
] as const
```

***

## Final `ProjectRepositoryConfig`

```ts
const ProjectRepositoryConfig = Schema.Struct({
  aggregate: ProjectAggregateConfig,
  entities: Schema.Record(Schema.String, Schema.Unknown),  // narrowed by concrete value
  selections: Schema.Array(ProjectSelectionConfig),
  updates: Schema.Array(ProjectUpdateConfig)
})

export const projectRepositoryConfig = {
  aggregate: {
    name: "Project",
    idSchema: ProjectId,
    versionSchema: Version,
    domainSchema: Project
  },
  entities: ProjectEntitiesConfig,
  selections: ProjectSelections,
  updates: ProjectUpdates
} satisfies Schema.To<typeof ProjectRepositoryConfig>
```

Conceptually this gives you:

- a single `projectRepositoryConfig` value that describes the **full aggregate shape** you showed,
- plus entity decomposition, allowed selection shapes, and update policies,
- all statically typed and validated by Effect Schema.

[1](https://effect.website/docs/schema/transformations/)
[2](https://www.youtube.com/watch?v=fKtpZ7STRKc)
[3](https://dev.to/martinpersson/building-robust-typescript-apis-with-the-effect-ecosystem-1m7c)
[4](https://www.typeonce.dev/article/how-to-implement-a-backend-with-effect)
[5](https://ybogomolov.me/03-effect-managing-dependencies)
[6](https://effect.website/docs/schema/effect-data-types/)
[7](https://effect.website/docs/schema/basic-usage/)
[8](https://github.com/fortanix/openapi-to-effect)
[9](https://effect.website/docs/schema/advanced-usage/)
[10](https://www.youtube.com/watch?v=nQA_JsCozU4)
[11](https://superforms.rocks/get-started/effect)
[12](https://github.com/PaulJPhilp/EffectPatterns)
[13](https://effect-ts.github.io/effect/effect/Data.ts.html)
[14](https://www.youtube.com/watch?v=o-SvvUA7hik)
[15](https://effect-ts.github.io/effect/effect/Config.ts.html)
[16](https://dnlytras.com/blog/effect-ts)
[17](https://www.sandromaglione.com/articles/complete-introduction-to-using-effect-in-typescript)
[18](https://dev.to/dzakh/javascript-schema-library-from-the-future-5420)
[19](https://www.reddit.com/r/typescript/comments/1f44lap/effect_standard_library_for_typescript/)
[20](https://tweag.io/blog/2024-11-07-typescript-effect/)
