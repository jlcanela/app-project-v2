import { Effect, Schema } from "effect";
import { Cosmos } from "./CosmosDb.js";

const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"));

export const ProjectEntity = Schema.Struct({
  id: ProjectId,
  ownerId: Schema.String,
  name: Schema.String,
  description: Schema.String,
  startDate: Schema.String,
  endDate: Schema.String,
  status: Schema.String
})

export const ProjectBudget = Schema.Struct({
  id: ProjectId,
  totalBudget: Schema.Number,
  currency: Schema.String,
})

export const ProjectFinancialInfo = Schema.Struct({
  id: Schema.String,
  financialId: Schema.String
})

const ProjectDeliverableId = Schema.String.pipe(Schema.brand("ProjectDeliverableId"));

export const ProjectDeliverable = Schema.Struct({
  id: ProjectDeliverableId,
  name: Schema.String
})

export const ProjectRootAggregate = Schema.Struct({
  ProjectEntity,
  financialInfo: ProjectFinancialInfo,
  budget: ProjectBudget.pipe(Schema.optional),
  deliverables: Schema.Array(ProjectDeliverable).pipe(Schema.optional)
})

interface RootAggregate<
  E extends Schema.Schema<any, any, any>>  {
  entity: E,
  items: ReadonlyArray<Schema.Schema<any, any, any>>,
  collections: ReadonlyArray<Schema.Schema<any, any, any>>,
}

const project = {
  "_tag": "Project",
  "id": "PRJ-101",
  "version": 3,
  "properties": {
    "ownerId": "PTY-1001",
    "name": "Project 1",
    "description": "Sample project 1 for demonstration.",
    "startDate": "2025-09-20",
    "endDate": "2026-09-16",
    "status": "Draft"
  },
  "financialInfo": {
    "id": "FIN-PRJ-101",
    "financialId": "COD-5001"
  },
  "budget": {
    "id": "PRJ-101",
    "totalBudget": 100000,
    "currency": "USD"
  },
  "deliverables": [
    {
      "id": "DEL-001",
      "name": "Initial Design Document"
    },
    {
      "id": "DEL-002",
      "name": "Prototype Implementation"
    }
  ]
}


export type Project = typeof ProjectRootAggregate.Type//Schema.Schema.Type<typeof Project>;

// 2. Generic transformer builder
export const makeCosmosTransformer = <
  T extends { id: string/*; _version?: number*/ },
  Tag extends string
>(
  tag: Tag,
  schema: Schema.Schema<T>
) =>
  Schema.transform(
    Schema.Struct({
      _tag: Schema.Literal(tag),
      id: Schema.String,
      //version: Schema.Number,
      properties: Schema.Record({ key: Schema.String, value: Schema.Unknown })
    }),
    schema,
    {
      strict: false,
      decode: (doc) => {
        const { id,/*, version,*/ properties } = doc as any
        return {
          id,
          //_version: version,
          ...properties
        } as T
      },
      encode: (entity) => {
        const { id, /*_version, */...rest } = entity as any
        return {
          _tag: tag,
          id,
          //version: _version,
          properties: rest
        }
      }
    }
  )


//type Project = typeof Project.Encoded

/**
 * T must be an object whose values are:
 * - nullable singletons (U | null), or
 * - readonly arrays (ReadonlyArray<U>).
 *
 * No unions beyond the nullable allowed at top level.
 */
export type AggregateShape = Record<string, unknown>;

// Top-level keys of the aggregate
export type AggregateKey<T extends AggregateShape> = keyof T & string;

// Keys whose values are NOT arrays (singletons, possibly nullable)
export type SingleItemKey<T extends AggregateShape> = {
  [K in AggregateKey<T>]:
  T[K] extends ReadonlyArray<any> ? never : K
}[AggregateKey<T>];

// Keys whose values are arrays
export type CollectionKey<T extends AggregateShape> =
  Exclude<AggregateKey<T>, SingleItemKey<T>>;

// Underlying payload type of a singleton field
export type SingleItemPayload<
  T extends AggregateShape,
  K extends SingleItemKey<T>
> =
  // T[K] must be U | null (or U)
  NonNullable<T[K]>;

// Underlying payload type of a collection field
export type CollectionItemPayload<
  T extends AggregateShape,
  K extends CollectionKey<T>
> =
  T[K] extends ReadonlyArray<infer I> ? I : never;

export type PartitionKey = string;

/**
 * Generic Cosmos service for an aggregate T stored in a single container,
 * partitioned by a partition key (e.g. projectId).
 *
 * Constraints on T:
 * - T is an object type.
 * - For any key K in T:
 *   - T[K] is either U | null (singleton) or ReadonlyArray<U> (collection).
 * - No additional union forms at the top level (besides nullable).
 */
export interface AggregateService<T extends AggregateShape> {

  /** Load the full aggregate for a given partition key. */
  loadAggregate(
    partitionKey: PartitionKey,
  ): Effect.Effect<T, Error>;

  /**
   * Load a single-item field (e.g. "entity", "core", "budget", ...).
   * K is restricted to keys where T[K] is NOT an array.
   * Returned type is the underlying payload or null.
   */
  getItem<K extends SingleItemKey<T>>(
    partitionKey: PartitionKey,
    key: K,
  ): Effect.Effect<SingleItemPayload<T, K> | null, Error>;

  /**
   * Load a collection field (e.g. "tasks", "milestones", ...).
   * K is restricted to keys where T[K] is an array.
   * Returned type is an array of the underlying payload.
   */
  queryItems<K extends CollectionKey<T>>(
    partitionKey: PartitionKey,
    key: K,
  ): Effect.Effect<ReadonlyArray<CollectionItemPayload<T, K>>, Error>;

  /**
   * Upsert a single-item field.
   * The caller passes the full payload (U) or null (to delete/clear).
   */
  upsertItem<K extends SingleItemKey<T>>(
    partitionKey: PartitionKey,
    key: K,
    value: SingleItemPayload<T, K> | null,
  ): Effect.Effect<void, Error>;

  /**
   * Upsert a single element of a collection field.
   * The concrete semantics (matching on id, append, etc.) are domain-specific.
   */
  upsertCollectionItem<K extends CollectionKey<T>>(
    partitionKey: PartitionKey,
    key: K,
    value: CollectionItemPayload<T, K>,
  ): Effect.Effect<void, Error>;

  /**
   * Delete one element from a collection field.
   * The identifier used to match the element is domain-specific (e.g. an id field inside the payload).
   */
  deleteCollectionItem<K extends CollectionKey<T>>(
    partitionKey: PartitionKey,
    key: K,
    predicate: (item: CollectionItemPayload<T, K>) => boolean,
  ): Effect.Effect<void, Error>;
}

// Tag for DI (parametric in T)
//export const makeCosmosAggregateServiceTag = <T extends AggregateShape>() =>
//  Effect.Tag<CosmosAggregateService<T>>();

export class Repository extends Effect.Service<Repository>()("app/CosmosDb", {
  effect: Effect.gen(function* () {

    const ProjectFromCosmos = makeCosmosTransformer("Project", ProjectRootAggregate.fields.entity)
    const cosmos = yield* Cosmos

    const upsertItem = Effect.fn("UpsertItem")(function* <K extends SingleItemKey<Project>>(partitionKey: PartitionKey,
      key: K,
      value: SingleItemPayload<Project, K> | null,) {
      if (value === null) {
        return yield* Effect.void
      }
      const encoded = yield* Schema.encode(ProjectFromCosmos)(value).pipe(Effect.tapError((e) => Effect.logError(`Encoding error: ${e.message}`)))
      yield* cosmos.upsertDocument(encoded)
      return yield* Effect.void //: Effect.Effect<void, Error>;
    })

    const getItem = Effect.fn("GetItem")(function* <
      K extends SingleItemKey<Project>
    >(
      partitionKey: PartitionKey,
      key: K,
      id: string,
    ) {

      yield* Effect.log(`Fetching item with id: ${id} and partitionKey: ${partitionKey}`)

      // //yield* Effect.log(cosmos.readDocument(id, id))
      // // 1. Fetch raw document from Cosmos
      //const projectContainer = cosmos.projectContainer
      //yield* Effect.log("info:", cosmos.info()) //osmos.info
      //yield* Effect.log(`Accessed project container: ${projectContainer}`)
      //const item = projectContainer.item("2025-11-30T22:38:45.604Z-PRJ-001")//.read()
      //const r = Effect.promise(() => item)
      //yield* Effect.log(`Read item result: ${JSON.stringify(r)}`)
      const raw = yield* cosmos.readDocument(id, id)

      yield* Effect.log(`Raw document from Cosmos: ${JSON.stringify(raw.item)}`)
      if (raw === null) {
       return null
      }

      // type Enc = typeof ProjectFromCosmos.Encoded
      // const item = raw as unknown as Enc
      // // 2. Decode Cosmos -> ProjectEntity
      const entity = yield* Schema.decode(ProjectFromCosmos)(raw.item as any).pipe(
        Effect.tapError(e =>
          Effect.logError(`Decoding error: ${e.message}`)
        )
      )

      yield* Effect.log(`Decoded entity: ${JSON.stringify(entity)}`)

      // // 3. Wrap in Project
      // const project: Project = { entity }

      // // 4. Narrow to SingleItemPayload<Project, K>
      // //    Typically SingleItemPayload<Project, 'entity'> is Project['entity'], etc.
      // //    If SingleItemPayload is properly defined, this cast is safe.
      // return project.entity as SingleItemPayload<Project, K>
      return raw.item
    })

    return {
      upsertItem,
      getItem,
    };
  }),
  dependencies: [Cosmos.Default]
}) { }
