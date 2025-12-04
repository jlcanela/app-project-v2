Concurrency for your repositories is mainly about **optimistic concurrency control** using a version (or ETag) on the aggregate, and ensuring all mutations check and bump that version atomically.[1][2]

***

## What concurrency is doing here

- Multiple commands may try to modify the same `Project` at the same time.[2]
- Optimistic concurrency assumes conflicts are rare; instead of locking rows, it **detects** whether someone else changed the aggregate since it was loaded.[3][4]
- In DDD, the **aggregate as a whole** is the concurrency boundary: any change to any child entity (e.g. `deliverables`) must be reflected in the aggregate version.[5][1]

For your `Project`:

- `version: 3` means “this snapshot is version 3 of project `PRJ-101`”.  
- Any successful write that changes any of `properties`, `financialInfo`, `budget`, or `deliverables` should result in `version = 4` in the stored state.

***

## Basic optimistic concurrency pattern

Flow (command handling):

1. Load aggregate (with `id` and `version`): `Project` version `v`.[6][2]
2. Apply domain logic to create a new `Project'`.  
3. When saving, include a **precondition**: “update row where `id = PRJ-101` and `version = v`”.[7][1]
4. If 1 row is updated: success; set `version = v+1` in storage.  
5. If 0 rows are updated: some other writer changed it first → **concurrency conflict**.[1][6]

The same applies to conditional entity/subset updates: the repository must check both the **aggregate id** and the **expected version** in a single transactional update.

***

## How to model concurrency in your config

From the earlier `UpdateConfig`, you can specialize for version-based concurrency on `Project`:

```ts
const ProjectConcurrencyConfig = {
  strategy: "version" as const,
  versionFieldPath: "version"  // path within the aggregate
}
```

Then embed this into each update definition:

```ts
const ProjectUpdates = [
  {
    name: "upsertProject",
    kind: "upsertAggregate" as const,
    concurrency: ProjectConcurrencyConfig
  },
  {
    name: "upsertDeliverable",
    kind: "upsertEntity" as const,
    target: { entityName: "deliverables" },
    concurrency: ProjectConcurrencyConfig
  },
  {
    name: "conditionalDeliverableUpdate",
    kind: "conditionalEntityUpdate" as const,
    target: { entityName: "deliverables" },
    conditionSchema: ProjectCondition,
    updateSchema: ProjectUpdateSpec,
    concurrency: ProjectConcurrencyConfig
  }
]
```

Conceptually:

- `strategy: "version"`: Use a numeric version field in the aggregate.[8][9]
- `versionFieldPath: "version"`: Where to read it from in the aggregate schema.  
- The repository implementation will:
  - Extract `version` from the domain object.  
  - Generate a storage-layer operation with `WHERE id = ? AND version = ?`.[1]
  - On success, persist `version + 1` (or whatever your store does automatically).

You could also support `"etag"` as a strategy when talking to Cosmos DB or HTTP APIs that return ETags instead of explicit numeric versions.[10][11][6]

***

## Using concurrency with different operations

### Full aggregate upsert

- `upsert(Project)`:
  - Read `version` field from the incoming aggregate.  
  - Try update with `WHERE id = @id AND version = @version`.  
  - On success, bump version in storage; repository returns the new aggregate (with updated version) or lets the caller reload.[2][7]

### Entity-level upsert

Even if you **only** update a deliverable:

- Repository internally must still treat `Project` as the concurrency boundary:
  - Load minimal projection including `version` and the target deliverable.[1]
  - Modify deliverable via aggregate/domain method.  
  - Save using optimistic concurrency on aggregate version as above.

### Conditional single-entity / subset update

Your `UpdateConfig` also has `conditionSchema` and `subsetSelectorSchema`. For concurrency:

- Conditions are evaluated on a **snapshot** that includes the version read from storage.[2]
- The final update still uses `WHERE id = @id AND version = @version` so that if someone else changed the aggregate between the read and the write, you get a concurrency failure even if your logical condition would still hold.

This avoids “lost updates” even when conditions themselves are satisfied in isolation.

***

## ETag vs version in practice

- **Version field**:
  - Usually an integer incremented on each aggregate change.[8]
  - Great for DB-centric systems (Postgres, Mongo, etc.).[7]

- **ETag**:
  - Opaque string representing version; commonly used at HTTP boundary, or by stores like Cosmos DB.[11][10][6]
  - Your `concurrency.strategy = "etag"` can mean:
    - Do not interpret version in the domain; just store/forward the opaque ETag.  
    - Repositories map between `Project.version` and underlying `_etag` if needed.

In Effect terms, you can have:

```ts
type ConcurrencyStrategy =
  | { _tag: "None" }
  | { _tag: "Version"; fieldPath: string }
  | { _tag: "ETag"; fieldPath: string }
```

and then a small interpreter in the persistence layer that converts that into the correct `WHERE` / `If-Match` / `_etag` usage.[12][13][10]

***

If you want, next step can be to sketch the actual Effect repository interface and the generic “apply concurrency strategy” function that your Postgres/Cosmos adapters would use.

[1](https://www.kamilgrzybek.com/blog/posts/handling-concurrency-aggregate-pattern-ef-core)
[2](https://reintech.io/blog/managing-transactions-concurrency-domain-driven-approach)
[3](https://learn.microsoft.com/en-us/ef/core/saving/concurrency)
[4](https://blog.appsignal.com/2021/07/13/building-aggregates-in-elixir-and-postgresql.html)
[5](https://hackernoon.com/concurrency-management-in-ddd)
[6](https://event-driven.io/en/how_to_use_etag_header_for_optimistic_concurrency/)
[7](https://www.mongodb.com/docs/entity-framework/v8.3/fundamentals/optimistic-concurrency/)
[8](https://www.doctrine-project.org/projects/doctrine-orm/en/3.5/reference/transactions-and-concurrency.html)
[9](https://stackoverflow.com/questions/49315711/ddd-should-optimistic-concurrency-property-etag-or-timestamp-ever-be-a-part)
[10](https://stackoverflow.com/questions/70785261/version-number-vs-etag-for-optimistic-concurrency)
[11](https://dev.to/petersaktor/handling-concurrency-in-cosmosdb-with-etags-15bd)
[12](https://smarttechie.co/how-to-handle-concurrent-updates-in-rest-apis-with-etags-210e74b14d99)
[13](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/ETag)
[14](https://www.jamesmichaelhickey.com/optimistic-concurrency/)
[15](https://stackoverflow.com/questions/50873959/optimistic-locking-aggregate-roots-internal-entity)
[16](https://martendb.io/tutorials/advanced-considerations)
[17](https://www.youtube.com/watch?v=hZ57CO7khvo)
[18](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-implementation-entity-framework-core)
[19](https://www.oreilly.com/library/view/implementing-domain-driven-design/9780133039900/app01lev1sec4.html)
[20](https://blog.peterritchie.com/posts/etags-in-aspdotnet-core)
