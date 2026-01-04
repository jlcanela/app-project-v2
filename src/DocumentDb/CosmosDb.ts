//import "dotenv/config"
import { CosmosClient, FeedOptions, type ItemDefinition, PartitionKey, PartitionKeyKind, QueryIterator, SqlQuerySpec } from "@azure/cosmos"
import { Config, ConfigProvider, Console, Context, Data, Effect, Layer, pipe, Schedule, Schema, Stream } from "effect"
// import { timed } from "./timed.ts"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  error: unknown
}> {
  toString() {
    return `Database read failed: ${this.error}`
  }
}

type CosmosConfig = { endpoint: string; key: string }

// A Config that expects a full connection string env var and parses it.
const cosmosFromConnectionString = Effect.fn("CosmosFromConnectionString")(function* (name: string) {

  const connectionString = yield* Config.nested(Config.string(name), "ConnectionStrings")
  const map = connectionString
    .split(";")
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const [k, ...rest] = part.split("=")
      acc[k] = rest.join("=")
      return acc
    }, {})

  const endpoint = map["AccountEndpoint"]
  const key = map["AccountKey"]

  if (!endpoint || !key) {
    return yield* Effect.fail("INVALID_COSMOSDB_CONNECTION_STRING")
  }

  return { endpoint, key } as CosmosConfig
})

// A Config that expects COSMOS_ENDPOINT / COSMOS_KEY directly.
const cosmosFromSeparateVars: Config.Config<CosmosConfig> = Config.all({
  endpoint: Config.string("COSMOS_ENDPOINT"),
  key: Config.string("COSMOS_KEY")
})

const cosmosConfig = Effect.fn(function* (
  name: string,
  provider: ConfigProvider.ConfigProvider
) {
  return yield* Effect.withConfigProvider(
    cosmosFromConnectionString(name),
    provider
  ).pipe(
    Effect.orElse(() => cosmosFromSeparateVars)
  )
})

export class CosmosClientC extends Context.Tag("CosmosClientC")<CosmosClientC, CosmosClient>() {}

const make = Effect.fn(function* (name: string, provider: ConfigProvider.ConfigProvider) {
   const { endpoint, key } = yield* cosmosConfig(name, provider)
   
    const connectionParams = {
      endpoint,
      key,
      connectionPolicy: {
        enableEndpointDiscovery: false,
      }
    }

    return new CosmosClient(connectionParams)
  
})

export const layerCosmos = ( provider: ConfigProvider.ConfigProvider) => Layer.effect(CosmosClientC, make("cosmos", provider))

export class CosmosContainer extends Effect.Service<CosmosContainer>()("app/CosmosContainer", {
  effect: Effect.gen(function* () {

    const client = yield* CosmosClientC // new CosmosClient(connectionParams)

    const initializeProjectDB = Effect.gen(function* () {
      // Create database if not exists
      const { database } = yield* Effect.tryPromise({
        try: () => client.databases.createIfNotExists({ id: "ProjectDB" }),
        catch: (error) => new DatabaseError({ error })
      }).pipe(Effect.withSpan("createDatabase"))

      yield* Effect.log("init databases").pipe(Effect.withSpan("init"))
      // Create container if not exists
      const { container } = yield* Effect.tryPromise({
        try: () =>
          database.containers.createIfNotExists({
            id: "Project",
            partitionKey: {
              paths: ["/project_id"],
              kind: PartitionKeyKind.Hash
            }
          }),
        catch: (error) => new DatabaseError({ error })
      }).pipe(Effect.withSpan("createContainer"))

      return container
    })

    const projectContainer = yield* initializeProjectDB.pipe(Effect.tapError((e) => Console.log(e)))

    return {
       projectContainer
    };
  }),
  dependencies: []
}) { }


export class Cosmos extends Effect.Service<Cosmos>()("app/CosmosDb", {
  effect: Effect.gen(function* () {

    const client = yield* CosmosClientC // new CosmosClient(connectionParams)

    const initializeProjectDB = Effect.gen(function* () {
      // Create database if not exists
      const { database } = yield* Effect.tryPromise({
        try: () => client.databases.createIfNotExists({ id: "ProjectDB" }),
        catch: (error) => new DatabaseError({ error })
      }).pipe(Effect.withSpan("createDatabase"))

      yield* Effect.log("init databases").pipe(Effect.withSpan("init"))
      // Create container if not exists
      const { container } = yield* Effect.tryPromise({
        try: () =>
          database.containers.createIfNotExists({
            id: "Project",
            partitionKey: {
              paths: ["/project_id"],
              kind: PartitionKeyKind.Hash
            }
          }),
        catch: (error) => new DatabaseError({ error })
      }).pipe(Effect.withSpan("createContainer"))

      return container
    })

    const projectContainer = yield* initializeProjectDB.pipe(Effect.tapError((e) => Console.log(e)))

    yield* Effect.log(`Cosmos DB initialized with projectContainer: ${projectContainer.id}`)

    const a = yield* Effect.promise(() => client.getReadEndpoint())

    const readAllDatabases = Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () => client.databases.readAll().fetchAll(),
        catch: (error) => new DatabaseError({ error })
      })
      return response.resources
    }).pipe(
      Effect.tapError((e) => Effect.logError(`Failed to read all databases: ${e.message}`)),
      Effect.withSpan("readAllDatabases")
    )

    const upsertDocument = <T>(t: T) => Effect.tryPromise({
      try: () => projectContainer.items.upsert(t),
      catch: (error) => {
        console.log(error)
        return new DatabaseError({ error })
      }
    })

      const deleteDocument =  Effect.fn("DeleteDocument")(function* (id: string, partitionKey: PartitionKey) {
        const res = yield* Effect.tryPromise({
          try: () => projectContainer.item(id, partitionKey).delete(), //.delete({}),//.upsert(t),
          catch: (error) => {
            console.log(error)
            return new DatabaseError({ error })
          }
        });
      return void 0
    })

    const queryDocument = (query: string | SqlQuerySpec, options?: FeedOptions) => Effect.gen(function*() {
      const feed = projectContainer.items.query(query, options).getAsyncIterator()
      const stream = Stream.fromAsyncIterable(feed, (e: any) =>  new Error(e?.message))
      return Stream.map(stream, item => item.resources)
      //Stream.fromAsyncIterable(projectContainer.items.query(query, options).getAsyncIterator(), (e: any) =>  new Error(e?.message))
    })
      

    const readDocument = Effect.fn("ReadDocument")(function* (id: string, partitionKey: PartitionKey) {
          const item = yield* Effect.tryPromise({
            try: async () => { 
              const item =  projectContainer.item(id, partitionKey);
              const p = await item.read();
              return p;
            },
            catch: (error) => {
              console.log(error)
              return new DatabaseError({ error })
            }
          }).pipe(Effect.tapError((e) => Effect.logError(`Failed to read document with id ${id}: ${e.message}`)))
          return item
        })
    
    const dummy = projectContainer.readPartitionKeyRanges

    return {
      read: a,
      readAllDatabases,
      upsertDocument,
      readDocument,
      queryDocument,
      deleteDocument,
      projectContainer,
      info: () => Effect.log("project container", projectContainer)
    };
  }),
  dependencies: []
}) { }

// export class Cosmos extends Effect.Service<Cosmos>()("app/CosmosDb", {
//   effect: timed(
//     "Creating CosmosDb Service",
//     Effect.gen(function* () {
//       const { endpoint, key } = yield* pipe(
//         connectionParam("cosmos"),
//         Effect.tapError((err) => Effect.log(err)),
//       )

//       const connectionParams = {
//         endpoint,
//         key,
//         connectionPolicy: {
//           enableEndpointDiscovery: false,
//         }
//       }

//       const client = new CosmosClient(connectionParams)

//       function readAllDatabases() {
//         return Effect.gen(function* () {
//           const response = yield* Effect.tryPromise({
//             try: () => client.databases.readAll().fetchAll(),
//             catch: (error) => new DatabaseError({ error })
//           })
//           return response.resources
//         }).pipe(
//           Effect.withSpan("readAllDatabases")
//         )
//       }

//       // Add this function to your Cosmos service class
//       function initializeProjectDB() {
//         return Effect.gen(function* () {
//           // Create database if not exists
//           const { database } = yield* Effect.tryPromise({
//             try: () => client.databases.createIfNotExists({ id: "ProjectDB" }),
//             catch: (error) => new DatabaseError({ error })
//           }).pipe(Effect.withSpan("createDatabase"))

//           yield* Effect.log("init databases").pipe(Effect.withSpan("init"))
//           // Create container if not exists
//           const { container } = yield* Effect.tryPromise({
//             try: () =>
//               database.containers.createIfNotExists({
//                 id: "Project",
//                 partitionKey: {
//                   paths: ["/project_id"],
//                   kind: PartitionKeyKind.Hash
//                 }
//               }),
//             catch: (error) => new DatabaseError({ error })
//           }).pipe(Effect.withSpan("createContainer"))

//           return container
//         })
//       }

//       const projectContainer = yield* initializeProjectDB().pipe(Effect.tapError((e) => Console.log(e)))

//       function query() {
//         const querySpec = {
//           query: "SELECT c.id, c.project_name, c.project_objective, c.project_description, c.project_stakeholders FROM c",
//           parameters: [
//           ],
//         };
//         return Effect.gen(function* () {
//           const response = yield* Effect.tryPromise({
//             try: () => projectContainer.items.query(querySpec).fetchAll(),
//             catch: (error) => new DatabaseError({ error })
//           })
//           return response.resources
//         }).pipe(
//           Effect.withSpan("readAllDatabases")
//         )
//       }

//       function readDocument(id: string) {
//         return Effect.gen(function* () {
//           const item = yield* Effect.tryPromise({
//             try: () => projectContainer.item(id, id).read(),
//             catch: (error) => new DatabaseError({ error })
//           })
//           return item
//         }).pipe(
//           Effect.withSpan("readDocument")
//         )
//       }

//       function writeDocument<T extends ItemDefinition>(t: T) {
//         return Effect.gen(function* () {
//           const itemResponse = yield* Effect.tryPromise({
//             try: () => projectContainer.items.create(t),
//             catch: (error) => {
//               new DatabaseError({ error })
//             }
//           })
//           return itemResponse
//         }).pipe(
//           Effect.withSpan("writeDocument")
//         )
//       }

//       // Helpers
//       const chunkItems = <T>(items: Array<T>, size: number): Array<Array<T>> =>
//         Array.from({ length: Math.ceil(items.length / size) }, (_, i) => items.slice(i * size, i * size + size))

//       const MAX_BATCH_SIZE = 100 // Cosmos DB's maximum per batch

//       function upsertChunk<T extends { id: string }>(chunk: Array<T>) {
//         return Effect.tryPromise({
//           try: () => {
//             const operations = chunk.map((item) => ({
//               operationType: "Upsert" as const,
//               resourceBody: item
//             }))

//             return projectContainer.items.bulk(operations, { continueOnError: true })
//           },
//           catch: (error) => {
//             console.error("Bulk upsert failed:", error)
//             return new DatabaseError({ error })
//           }
//         }).pipe(Effect.withSpan("upsertChunk"))
//       }

//       function bulkUpsertDocuments<T extends { id: string }>(items: Array<T>, concurrency = 25) {
//         return Effect.gen(function* () {
//           const chunks = chunkItems(items, MAX_BATCH_SIZE)

//           const results = yield* Effect.forEach(chunks, upsertChunk, { concurrency })

//           return results.flatMap((batchResult) =>
//             batchResult.map((item) => item.statusCode === 201 ? "Inserted" : "Updated")
//           )
//         }).pipe(
//           Effect.withSpan("bulkUpsertDocuments")
//         )
//       }

//       function upsertDocument<T>(t: T) {
//         return Effect.gen(function* () {
//           const itemResponse = yield* Effect.tryPromise({
//             try: () => projectContainer.items.upsert(t),
//             catch: (error) => {
//               new DatabaseError({ error })
//             }
//           })
//           return itemResponse
//         }).pipe(
//           Effect.withSpan("upsertDocument")
//         )
//       }

//       function concurrentUpserts<T>(documents: Array<T>, concurrency = 100) {
//         return pipe(
//           Effect.forEach(
//             documents,
//             (doc) => upsertDocument(doc),
//             { concurrency }
//           ).pipe(
//             Effect.retry(Schedule.exponential(100, 1.2))
//           ),
//           Effect.withSpan("concurrentUpserts")
//         )
//       }

//       return {
//         readAllDatabases,
//         readDocument,
//         writeDocument,
//         upsertDocument,
//         concurrentUpserts,
//         bulkUpsertDocuments,
//         initializeProjectDB,
//         query
//       } as const
//     })
//   ),
//   dependencies: []
// }) { }



// // 2. Generic transformer builder
// export const makeCosmosTransformer = <
//   T extends { id: string/*; _version?: number*/ },
//   Tag extends string
// >(
//   tag: Tag,
//   schema: Schema.Schema<T>
// ) =>
//   Schema.transform(
//     Schema.Struct({
//       _tag: Schema.Literal(tag),
//       id: Schema.String,
//       //version: Schema.Number,
//       properties: Schema.Record({ key: Schema.String, value: Schema.Unknown })
//     }),
//     schema,
//     {
//       strict: false,
//       decode: (doc) => {
//         const { id,/*, version,*/ properties } = doc as any
//         return {
//           id,
//           //_version: version,
//           ...properties
//         } as T
//       },
//       encode: (entity) => {
//         const { id, /*_version, */...rest } = entity as any
//         return {
//           _tag: tag,
//           id,
//           //version: _version,
//           properties: rest
//         }
//       }
//     }
//   )

  
// export class RepositoryA extends Effect.Service<RepositoryA>()("app/CosmosDb", {
//   effect: Effect.gen(function* () {

//     const ProjectFromCosmos = makeCosmosTransformer("Project", ProjectRootAggregate.fields.entity)
//     const cosmos = yield* Cosmos

//     const upsertItem = Effect.fn("UpsertItem")(function* <K extends SingleItemKey<Project>>(partitionKey: PartitionKey,
//       key: K,
//       value: SingleItemPayload<Project, K> | null,) {
//       if (value === null) {
//         return yield* Effect.void
//       }
//       const encoded = yield* Schema.encode(ProjectFromCosmos)(value).pipe(Effect.tapError((e) => Effect.logError(`Encoding error: ${e.message}`)))
//       yield* cosmos.upsertDocument(encoded)
//       return yield* Effect.void //: Effect.Effect<void, Error>;
//     })

//     const getItem = Effect.fn("GetItem")(function* <
//       K extends SingleItemKey<Project>
//     >(
//       partitionKey: PartitionKey,
//       key: K,
//       id: string,
//     ) {

//       yield* Effect.log(`Fetching item with id: ${id} and partitionKey: ${partitionKey}`)

//       // //yield* Effect.log(cosmos.readDocument(id, id))
//       // // 1. Fetch raw document from Cosmos
//       //const projectContainer = cosmos.projectContainer
//       //yield* Effect.log("info:", cosmos.info()) //osmos.info
//       //yield* Effect.log(`Accessed project container: ${projectContainer}`)
//       //const item = projectContainer.item("2025-11-30T22:38:45.604Z-PRJ-001")//.read()
//       //const r = Effect.promise(() => item)
//       //yield* Effect.log(`Read item result: ${JSON.stringify(r)}`)
//       const raw = yield* cosmos.readDocument(id, id)

//       yield* Effect.log(`Raw document from Cosmos: ${JSON.stringify(raw.item)}`)
//       if (raw === null) {
//        return null
//       }

//       // type Enc = typeof ProjectFromCosmos.Encoded
//       // const item = raw as unknown as Enc
//       // // 2. Decode Cosmos -> ProjectEntity
//       const entity = yield* Schema.decode(ProjectFromCosmos)(raw.item as any).pipe(
//         Effect.tapError(e =>
//           Effect.logError(`Decoding error: ${e.message}`)
//         )
//       )

//       yield* Effect.log(`Decoded entity: ${JSON.stringify(entity)}`)

//       // // 3. Wrap in Project
//       // const project: Project = { entity }

//       // // 4. Narrow to SingleItemPayload<Project, K>
//       // //    Typically SingleItemPayload<Project, 'entity'> is Project['entity'], etc.
//       // //    If SingleItemPayload is properly defined, this cast is safe.
//       // return project.entity as SingleItemPayload<Project, K>
//       return raw.item
//     })

//     return {
//       upsertItem,
//       getItem,
//     };
//   }),
//   dependencies: [Cosmos.Default]
// }) { }
