// src/Repository/DocumentDb.ts
import type { SqlQuerySpec } from "@azure/cosmos";
import { Chunk, Context, Effect, Layer, Stream } from "effect";
import { Cosmos } from "./CosmosDb.js";

// A unique identifier for a document in the document store.
// This could be a simple string or a more structured type.
export type DocumentId = string;

export type PartitionId = string;

export class DocumentDb extends Context.Tag("DocumentDb")<DocumentDb, {
  /**
   * Retrieves a document by its unique ID.
   * @param documentId The unique identifier of the document.
   * @returns An Effect that succeeds with the document payload (Type T) or null if not found.
   */
  get<T>(documentId: DocumentId, partitionId: PartitionId): Effect.Effect<T | null, Error>;
  
  /**
   * Retrieves multiple documents based on a query.
   * The query can be a simple partition key, or more complex filters depending on the underlying DocumentDb implementation.
   * @param query An object defining the query criteria.
   * @returns An Effect that succeeds with a ReadonlyArray of document payloads (Type T).
   */
  query<T>(query: Record<string, any>, partitionId?: PartitionId): Effect.Effect<ReadonlyArray<T>, Error>;
  
  /**
   * Upserts (inserts or updates) a document.
   * @param documentId The unique identifier of the document.
   * @param document The document payload to upsert.
   * @returns An Effect that succeeds when the operation is complete.
   */
  upsert<T>(documentId: DocumentId, partitionId: PartitionId, document: T): Effect.Effect<void, Error>;
  
  /**
   * Deletes a document by its unique ID.
   * @param documentId The unique identifier of the document to delete.
   * @returns An Effect that succeeds when the operation is complete.
   */
  delete(documentId: DocumentId, partitionId: PartitionId): Effect.Effect<void, Error>;
}>() {}

export const makeKV = Effect.fnUntraced(function*(options: {}){
  // simple in-memory map: keys are `doc:{partition}:{id}` and values are JSON strings
  const store = new Map<string, string>()

  const makeKey = (id: DocumentId, partition: PartitionId) => `doc:${partition}:${id}`

  return DocumentDb.of({
    get: <T>(documentId: DocumentId, partitionId: PartitionId) =>
      Effect.succeed((() => {
        const k = makeKey(documentId, partitionId)
        if (!store.has(k)) return null
        try {
          return JSON.parse(store.get(k)!) as T
        } catch {
          console.log("Failed to parse JSON for key:", k);
          store.forEach((v, k) => console.log(k, v))
          return null
        }
      })()),

    query: <T>(query: Record<string, any>, partitionId?: PartitionId) =>
      Effect.succeed((() => {
        const prefix = partitionId ? `doc:${partitionId}:` : "doc:"        
        const results: T[] = []
        for (const [k, v] of store.entries()) {
          if (!k.startsWith(prefix)) continue
          try {
            const obj = JSON.parse(v) as any
            let match = true
            for (const qk in query) {
              if ((obj as any)[qk] !== (query as any)[qk]) { 
                match = false; 
                break 
              }
            }
            if (match) {
              results.push(obj)
            }
          } catch {
            // skip invalid JSON
          }
        }
        return results
      })()),

    upsert: <T>(documentId: DocumentId, partitionId: PartitionId, document: T) =>
      Effect.succeed((() => {
        const k = makeKey(documentId, partitionId)
        store.set(k, JSON.stringify(document))
        return void 0
      })()),

    delete: (documentId: DocumentId, partitionId: PartitionId) =>
      Effect.succeed((() => {
        const k = makeKey(documentId, partitionId)
        store.delete(k)
        return void 0
      })())
  })
})

export const layerKV: Layer.Layer<DocumentDb, never> = Layer.effect(DocumentDb, makeKV({}))

export const makeCosmos = Effect.fnUntraced(function*(options: {}){
  // simple in-memory map: keys are `doc:{partition}:{id}` and values are JSON strings
  //const store = new Map<string, string>()

  const cosmos = yield* Cosmos

  //console.log(cosmos)
//  const makeKey = (id: DocumentId, partition: PartitionId) => `doc:${partition}:${id}`

  return DocumentDb.of({
    get: <T>(documentId: DocumentId, partitionId: PartitionId) => Effect.gen(function*() {
      const res = (yield* cosmos.readDocument(documentId, partitionId)).resource
      return res as T
    }),

    query: <T>(query: Record<string, any>, partitionId?: PartitionId) => Effect.gen(function*() {
      const querySpec: SqlQuerySpec = {
        query: "select * from c",
        parameters: []
      };

      if (query && Object.keys(query).length > 0) {
        const whereClauses = Object.keys(query).map(key => {
          const paramName = `@${key}`;
          querySpec.parameters!.push({ name: paramName, value: query[key] });
          return `c.${key} = ${paramName}`;
        });
        querySpec.query += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      const chunk = yield* Stream.runCollect(yield* cosmos.queryDocument(querySpec))
      const arr = Chunk.toArray(chunk.pipe(Chunk.map(arr => Chunk.fromIterable(arr)), Chunk.flatten))
    
      return arr as T[];
    }),

    upsert: <T>(documentId: DocumentId, partitionId: PartitionId, document: T) => Effect.gen(function*() {
      //console.log("Upserting document:", documentId, partitionId, document)
      const res = yield* cosmos.upsertDocument({
        ...document as any,
        project_id: partitionId
        //id: documentId,
        //partitionKey: partitionId
      })
      return res
    }),
     
    delete: (documentId: DocumentId, partitionId: PartitionId) => Effect.gen(function*() {
      //yield* cosmos.projectContainer.items.delete(documentId, partitionId)
      const res = yield* cosmos.deleteDocument(documentId, partitionId)
      return void 0
    })
    // delete: (documentId: DocumentId, partitionId: PartitionId) =>
    //
      // Effect.succeed((() => {
      //   const k = makeKey(documentId, partitionId)
      //   store.delete(k)
      //   return void 0
      // })())
  })
})

export const layerCosmos: Layer.Layer<DocumentDb, never, Cosmos> = Layer.effect(DocumentDb, makeCosmos({}))
