A useful configuration model should describe “what this repository handles” (aggregate + entities + ids) and “what kinds of operations are allowed” (full load, subsets, graphql-like selections, conditional updates), not the technical implementation. Effect Schema can then give you static types for all of this.

Below is a conceptual model you can map to `@effect/schema/Schema` (or `effect/Schema` v3) definitions.

***

## Top-level configuration

Think of a **RepositoryConfig** schema as the root:

- Aggregate metadata (id, version, type tags)
- Entity model map (child entities and collections)
- Supported queries/selections
- Supported update policies and constraints

Conceptually:

```ts
RepositoryConfig = {
  aggregate: AggregateConfig
  entities: Record<EntityName, EntityConfig>
  selections: SelectionConfig[]
  updates: UpdateConfig[]
}
```

***

## Aggregate and entity configs

### AggregateConfig

- `name`: unique aggregate name.
- `id`: schema for the aggregate id type.
- `version`: schema for concurrency version (optional).
- `rootSchema`: schema for full aggregate state (domain object).
- `persistence`: mapping schema if you distinguish domain vs persistence (e.g. `AggregatePersistenceSchema` + transforms).

Conceptually:

```ts
AggregateConfig = {
  name: string
  idSchema: Schema<AggregateId>
  versionSchema?: Schema<Version>
  domainSchema: Schema<AggregateRoot>
  persistenceSchema?: Schema<PersistedAggregate>
  transforms?: {
    toPersistence?: Transform<AggregateRoot, PersistedAggregate>
    fromPersistence?: Transform<PersistedAggregate, AggregateRoot>
  }
}
```

### EntityConfig

Each child entity or collection is described separately so the repository can drive:

- “load subset by entity type”
- “graphql-like” selections
- conditional updates.

Conceptually:

```ts
EntityConfig = {
  name: string
  kind: "single" | "collection"
  path: string            // path from root, e.g. "billingAddress" or "items"
  idSchema?: Schema<EntityId>  // required for identifiable entities
  domainSchema: Schema<Entity>
  persistenceSchema?: Schema<PersistedEntity>
  constraints?: ConstraintConfig[]
}
```

***

## Selection and query configuration

### SelectionConfig (subset / by type / graphql-like)

This describes **what shapes you allow** the client to request, not the low-level DB query.

You can model three levels:

- Root-only or “full” selection.
- By-entity-type selection.
- GraphQL-like structured selection with filters.

Conceptually:

```ts
SelectionConfig = {
  name: string                      // e.g. "full", "rootOnly", "withItems"
  kind: "full" | "root" | "byEntityType" | "structured"
  allowedEntities?: EntityName[]    // for "byEntityType"
  shape?: SelectionShape            // for "structured"
}

SelectionShape = {
  fields: string[]                  // allowed root fields
  entities?: {
    [entityName: string]: {
      included: boolean
      fields?: string[]
      filterSchema?: Schema<EntityFilter>  // filter type for this entity
    }
  }
}
```

Your “GraphQL-like query” is then an **input schema**:

```ts
AggregateSelectionQuery = Schema<{
  selectionName: string
  args?: unknown                     // validated using SelectionConfig.shape.* filterSchema
}>
```

***

## Update policies and conditions

### UpdateConfig

Describe which kinds of updates the repository supports and how they are constrained:

- full upsert
- entity upsert
- conditional single-entity update
- conditional subset update

Conceptually:

```ts
UpdateConfig = {
  name: string
  kind:
    | "upsertAggregate"
    | "upsertEntity"
    | "upsertEntities"
    | "conditionalEntityUpdate"
    | "conditionalSubsetUpdate"
  target?: {
    entityName?: EntityName     // for entity/scoped updates
    subsetSelectorSchema?: Schema<SubsetSelector> // for subset updates
  }
  conditionSchema?: Schema<Condition> // what preconditions look like
  updateSchema?: Schema<UpdateSpec>   // declarative update description
  concurrency?: {
    strategy: "version" | "etag" | "none"
    versionFieldPath?: string
  }
}
```

Where `Condition`, `SubsetSelector`, and `UpdateSpec` are domain-specific ADTs you define with `Schema.union(...)`, `Schema.struct(...)`, etc., describing predicates and transformations you are willing to support.

***

## Putting it together as Effect Schema

In `@effect/schema` terms you end up with something like:

- `AggregateConfigSchema`
- `EntityConfigSchema`
- `SelectionConfigSchema`
- `UpdateConfigSchema`
- `RepositoryConfigSchema = Schema.struct({ ... })`

Then each concrete repository is just a value:

```ts
const OrderRepositoryConfig = RepositoryConfigSchema.make({
  aggregate: { ... },
  entities: { orderItem: { ... }, shipment: { ... } },
  selections: [ ... ],
  updates: [ ... ]
})
```

This model lets you:

- Derive repository interfaces from config types.
- Validate configuration at startup.
- Keep domain, persistence, and query/update capabilities explicitly described and type-safe.

[1](https://github.com/PaulJPhilp/EffectPatterns)
[2](https://effect.website/docs/schema/transformations/)
[3](https://mufraggi.eu/articles/create-api-with-effect-ts)
[4](https://dev.to/martinpersson/building-a-robust-backend-with-effect-graphql-and-drizzle-k4j)
[5](https://github.com/Effect-TS/examples)
[6](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
[7](https://dev.to/martinpersson/building-robust-typescript-apis-with-the-effect-ecosystem-1m7c)
[8](https://effect-ts.github.io/effect/sql/Model.ts.html)
[9](https://khalilstemmler.com/articles/typescript-domain-driven-design/aggregate-design-persistence/)
[10](https://andrea-acampora.github.io/nestjs-ddd-devops/)
[11](https://www.sandromaglione.com/articles/from-fp-ts-to-effect-ts-migration-guide)
[12](https://github.com/ddd-crew/aggregate-design-canvas)
[13](https://github.com/jkonowitch/hex-effect)
[14](https://blog.stackademic.com/effect-typescript-database-migration-804d71fb8564)
[15](https://stackoverflow.com/questions/1633434/domain-driven-design-repositories-and-aggregate-roots)
[16](https://effect.website/blog/ts-plus-postmortem/)
[17](https://effect.website/docs/schema/introduction/)
[18](https://dev.to/dhanush___b/database-schema-design-for-scalability-best-practices-techniques-and-real-world-examples-for-ida)
[19](https://stackoverflow.com/questions/75607921/functional-domain-driven-design-using-typescript)
[20](https://liambx.com/blog/mongodb-data-modeling-schema-design-guide)
