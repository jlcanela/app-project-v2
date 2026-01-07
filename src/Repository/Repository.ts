import { Effect, Schema } from "effect"
import type { AggregateRoot, PartitionKeyOf, RepositoryConfig, EntityConfig, AggregateId, AllRows } from "./Common.js"
import { DocumentDb, DocumentId, PartitionId } from "../DocumentDb/Document.js";
import { mergeDocuments, splitDocuments } from "./utils.js";

import { CompoundCondition, Condition, guard, interpret, MongoQuery } from "@ucast/mongo2js";

// Helper types to extract entity information from RepositoryConfig
type SingleEntityNamesFromConfig<R extends RepositoryConfig<any, any, any, any, any, any>> = {
  [K in keyof R["entities"]]: R["entities"][K]["kind"] extends "single" ? K : never
}[keyof R["entities"]];

type SingleItemKey<R extends RepositoryConfig<any, any, any, any, any, any>> = R["root"]["name"] | SingleEntityNamesFromConfig<R>;

type EntityPayload<R extends RepositoryConfig<any, any, any, any, any, any>, K extends SingleItemKey<R>> =
  K extends R["root"]["name"]
  ? Schema.Schema.Type<R["root"]["domainSchema"]>
  : K extends keyof R["entities"]
  ? R["entities"][K] extends EntityConfig<any, any, infer S, 'single'>
  ? Schema.Schema.Type<S>
  : never
  : never;

// Helper types to extract entity information from RepositoryConfig
type CollectionItemKey<R extends RepositoryConfig<any, any, any, any, any, any>> = {
  [K in keyof R["entities"]]: R["entities"][K]["kind"] extends "collection" ? K : never
}[keyof R["entities"]];

type CollectionItemPayload<R extends RepositoryConfig<any, any, any, any, any, any>, K extends CollectionItemKey<R>> =
  K extends keyof R["entities"]
  ? R["entities"][K] extends EntityConfig<any, any, infer S, 'collection'>
  ? Schema.Schema.Type<S>
  : never
  : never;

// Generic repository interface
export interface Repository<
  R extends RepositoryConfig<any, any, any, any, any, any>,
  AggregateId = Schema.Schema.Type<R["root"]["idSchema"]>,
  PartitionKey = PartitionKeyOf<R>,
  Aggregate = AggregateRoot<R>
> {
  readonly search: (query: string) => Effect.Effect<readonly Aggregate[], Error, SecurityPredicate>

  readonly getById: (id: AggregateId) => Effect.Effect<Aggregate, Error>
  readonly upsert: (value: Aggregate) => Effect.Effect<void, Error>
  readonly delete: (id: AggregateId) => Effect.Effect<void, Error>
  /**
   * Load a single-item entity (e.g. "project", "budget", ...).
   * K is restricted to the names of entities with kind "root" or "single".
   * Returned type is the underlying entity payload or null.
   */
  getItem<K extends SingleItemKey<R>>(
    partitionKey: PartitionKey,
    key: K,
  ): Effect.Effect<EntityPayload<R, K> | null, Error>;

  /**
   * Load a collection field (e.g. "tasks", "milestones", ...).
   * K is restricted to keys where T[K] is an array.
   * Returned type is an array of the underlying payload.
   */
  queryItems<K extends CollectionItemKey<R>>(
    partitionKey: PartitionKey,
    key?: K,
  ): Effect.Effect<ReadonlyArray<CollectionItemPayload<R, K>>, Error>;

  /**
   * Upsert a single-item field.
   * The caller passes the full payload (U) or null (to delete/clear).
   */
  upsertItem<K extends SingleItemKey<R>>(
    partitionKey: PartitionKey,
    key: K,
    value: EntityPayload<R, K> | null,
  ): Effect.Effect<void, Error>;

  /**
   * Upsert a single element of a collection field.
   * The concrete semantics (matching on id, append, etc.) are domain-specific.
   */
  upsertCollectionItem<K extends CollectionItemKey<R>>(
    partitionKey: PartitionKey,
    key: K,
    value: CollectionItemPayload<R, K>,
  ): Effect.Effect<void, Error>;

  /**
   * Delete one element from a collection field.
   * The identifier used to match the element is domain-specific (e.g. an id field inside the payload).
   */
  deleteCollectionItem<K extends CollectionItemKey<R>>(
    partitionKey: PartitionKey,
    key: K,
    predicate: (item: CollectionItemPayload<R, K>) => boolean,
  ): Effect.Effect<void, Error>;

}

export const makeCosmosTransformer = <
  T extends { id: string, partitionKey: string/*; _version?: number*/ },
  Tag extends string
>(
  tag: Tag,
  partitionKeyName: string,
  schema: Schema.Schema<T>
) =>
  Schema.transform(
    Schema.Struct({
      type: Schema.Literal(tag),
      id: Schema.String,
      [partitionKeyName]: Schema.String,
      //version: Schema.Number,
      properties: Schema.Record({ key: Schema.String, value: Schema.Unknown })
    }),
    schema,
    {
      strict: false,
      decode: (doc) => {
        const { id, [partitionKeyName]: partitionKey,/*, version,*/ properties } = doc as any
        return {
          id,
          [partitionKeyName]: partitionKey,
          //_version: version,
          ...properties
        } as T
      },
      encode: (entity) => {
        const { id, [partitionKeyName]: partitionKey,/*_version, */...rest } = entity as any
        const encoded = {
          type: tag,
          id,
          [partitionKeyName]: partitionKey,
          //version: _version,
          properties: rest
        }
        return encoded
      }
    }
  )

// eslint-disable-next-line no-use-before-define
export class SecurityPredicate extends Effect.Service<SecurityPredicate>()("app/SecurityPredicate", {
  effect: Effect.gen(function* () {
    const securityFilter = Effect.fn("Repository.securityFilter")(function* () {
      const securityFilter = {} as Condition<unknown>
      return securityFilter
    })

    return {
      securityFilter,
    } as const;
  }),
}) { }

// const makeRepository: <R extends RepositoryConfig<any, any, any, any, any, any>>(repositoryConfig: R) => Effect.Effect<Repository<R>, never, DocumentDb>
export const makeRepository = <
  R extends RepositoryConfig<any, any, any, any, any, any>
>(
  repositoryConfig: R
) => Effect.gen(function* () {
  type AggregateId = Schema.Schema.Type<R["root"]["idSchema"]>
  type PartitionKey = PartitionKeyOf<R>
  type Aggregate = AggregateRoot<R>

  const rootKey = repositoryConfig.root.name

  const transformer = makeCosmosTransformer<R["root"]["domainSchema"], R["root"]["name"]>(
    repositoryConfig.root.name,
    repositoryConfig.aggregate.partitionKey,
    repositoryConfig.root.domainSchema
  )

  // Depending on your layout, you might derive a collection / container name:
  //const container = repositoryConfig.container ?? repositoryConfig.root.name

  // Helper to build a DocumentDb id from partition + key + item id, etc.
  const docId = (partition: PartitionKey, key: string, id?: string) =>
    id ?? String(partition)

  const db = yield* DocumentDb

  const isEmptyCondition = (c: object) => Object.keys(c).length === 0;

  const includeSecurityCondition = <Aggregate>(searchPredicate: MongoQuery<Aggregate>) =>
    Effect.gen(function* () {
   
      const q = guard<Aggregate>(searchPredicate)
      const searchFilter = q.ast as Condition<Aggregate>

      // // get SecurityPredicate service
      const security = yield* SecurityPredicate
      
      // // run the effect that computes the security filter
      const securityFilterUnknown = yield* security.securityFilter()
      const securityFilter = securityFilterUnknown as Condition<Aggregate>
      
      if (isEmptyCondition(securityFilter)) {
        return searchFilter
      } else {
        if (isEmptyCondition(securityFilter)) {
          return searchFilter
        }
        return new CompoundCondition('and', [searchFilter, securityFilter])
      }
    })

    const condition2predicate = (c: Condition<unknown>) => isEmptyCondition(c) ? () => true : (a: Aggregate) => interpret(c, a)
    

  //  readonly search: () => Effect.Effect<readonly Aggregate[], Error>
  const search = Effect.fn("Repository.search")(function* (query: string) {

    const res = (yield* db.query<Aggregate>({}, undefined)) as AllRows<R>[]
    if (!res) {
      return yield* Effect.fail(new Error("Not found"))
    }
    const aggregates = mergeDocuments(res, { config: repositoryConfig, transformer })

    let searchPredicate = {} as MongoQuery<Aggregate>

    if (query) {
      try {
        searchPredicate = JSON.parse(query)
      } catch {
      }
    }
    const condition = yield* includeSecurityCondition(searchPredicate)
    const predicate = condition2predicate(condition) 

    return aggregates.filter(predicate)
  })

  const getById = Effect.fn("Repository.getById")(function* (id: AggregateId) {
    const res = (yield* db.query<Aggregate>({}, id as PartitionId)) as AllRows<R>[]
    if (!res) {
      return yield* Effect.fail(new Error("Not found"))
    }
    const r = mergeDocuments(res, { config: repositoryConfig, transformer })
    return r && r[0]
  })

  const upsert = Effect.fn("Repository.upsert")(function* (value: Aggregate) {
    const id = value.id
    const documents = splitDocuments(value, { config: repositoryConfig })
    for (const doc of documents) {
      yield* db.upsert<unknown>(doc.id as unknown as DocumentId, id as PartitionId, doc)
    }
  })

  const remove = Effect.fn("Repository.delete")(function* (id: AggregateId) {
    yield* db.delete(
      docId(id as unknown as PartitionKey, rootKey, String(id)),
      id as PartitionId
    )
  })

  // ----- single items -----

  const getItem = Effect.fn("Repository.getItem")(function* (partitionKey, key) {
    type Payload = EntityPayload<R, typeof key>
    const res = yield* db.get<Payload>(
      docId(partitionKey, String(key)),
      partitionKey
    )
    return res
  })

  const queryItems = Effect.fn("Repository.queryItems")(function* (partitionKey, key) {
    type Payload = CollectionItemPayload<R, typeof key>
    // Very naive: all docs in partition with this "type"/key
    const results = yield* db.query<Payload>(
      {},//{ key: String(key) },
      partitionKey
    )
    return results
  })

  const upsertItem = Effect.fn("Repository.upsertItem")(function* (partitionKey, key, value) {
    const id = docId(partitionKey, String(key))
    if (value === null) {
      yield* db.delete(id, partitionKey)
    } else {
      type Payload = EntityPayload<R, typeof key>
      yield* db.upsert<Payload>(id, partitionKey, value)
    }
  })

  // ----- collections -----

  const upsertCollectionItem = Effect.fn("Repository.upsertCollectionItem")(function* (partitionKey, key, value) {
    type Payload = CollectionItemPayload<R, typeof key>
    const id = (value as any).id ?? crypto.randomUUID()
    yield* db.upsert<Payload>(
      docId(partitionKey, String(key), id),
      partitionKey,
      { ...value, id } as Payload
    )
  })

  const deleteCollectionItem = Effect.fn("Repository.deleteCollectionItem")(function* (partitionKey, key, predicate) {
    type Payload = CollectionItemPayload<R, typeof key>
    const docs = yield* db.query<Payload>(
      { key: String(key) },
      partitionKey
    )
    const toDelete = docs.filter(predicate)
    yield* Effect.forEach(
      toDelete,
      (d) =>
        db.delete(
          docId(
            partitionKey,
            String(key),
            (d as any).id ?? JSON.stringify(d)
          ),
          partitionKey
        ),
      { discard: true }
    )
  })

  return {
    // ----- aggregate root -----
    search,
    getById,
    upsert,
    delete: remove,
    // ----- single items -----
    getItem,
    queryItems,
    upsertItem,
    // ----- collections -----
    upsertCollectionItem,
    deleteCollectionItem
  } as Repository<R, AggregateId, PartitionKey, Aggregate>
})
