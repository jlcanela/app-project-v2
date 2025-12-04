//import "dotenv/config"
import { CosmosClient, type ItemDefinition, PartitionKey, PartitionKeyKind } from "@azure/cosmos"
import { clientAbortFiberId } from "@effect/platform/HttpServerError";
import { Console, Data, Effect, pipe, Schedule } from "effect"
// import { timed } from "./timed.ts"

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  error: unknown
}> {
  toString() {
    return `Database read failed: ${this.error}`
  }
}

function connectionParam(name: string): Effect.Effect<{ endpoint: string; key: string }, string> {

  const connectionStringName = `ConnectionStrings__${name}`;
  const connectionString = process.env[connectionStringName]
  const cosmosEndpoint = process.env.COSMOS_ENDPOINT;
  const cosmosKey = process.env.COSMOS_KEY;

  if (connectionString) {
    const parts = connectionString.split(';').filter(Boolean);
    const map: Record<string, string> = {};
    for (const part of parts) {
      const [key, ...rest] = part.split('=');
      map[key] = rest.join('=');
    }
    const endpoint = map['AccountEndpoint'];
    const key = map['AccountKey'];
    if (endpoint && key) {
      return Effect.succeed({ endpoint, key });
    }
  } else if (cosmosEndpoint && cosmosKey) {
    return Effect.succeed({ endpoint: cosmosEndpoint, key: cosmosKey });
  }
  return Effect.fail("INVALID_COSMOSDB_CONFIG");
}

export class Cosmos extends Effect.Service<Cosmos>()("app/CosmosDb", {
  effect: Effect.gen(function* () {

    const { endpoint, key } = yield* pipe(
      connectionParam("cosmos"),
      Effect.tapError((err) => Effect.log(err)),
    )

    const connectionParams = {
      endpoint,
      key,
      connectionPolicy: {
        enableEndpointDiscovery: false,
      }
    }

    const client = new CosmosClient(connectionParams)

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

    yield* Effect.log(`Cosmos DB initialized with projectContainer: ${projectContainer}`)

    const a = yield* Effect.promise(() => client.getReadEndpoint())
    // const { endpoint, key } = yield* pipe(
    //   connectionParam("cosmos"),
    //   Effect.tapError((err) => Effect.log(err)),
    // )

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
      catch: (error) => new DatabaseError({ error })
    })

    const readDocument = Effect.fn("ReadDocument")(function* (id: string, partitionKey: PartitionKey) {
      yield* Effect.log(`Reading document with id: ${id} and partitionKey: ${partitionKey}`);
          const item = yield* Effect.tryPromise({
            try: async () => { 
              console.log(`Reading document with id: ${id} and partitionKey: ${partitionKey}`);
              const item =  projectContainer.item(id)
              //console.log(`Retrieved item: ${JSON.stringify(item)}`);
              const p = await item.read();
              console.log(`Read item result: ${JSON.stringify(p.item.id)}`);
              return p;
            },
            catch: (error) => {
              console.log(error)
              return new DatabaseError({ error })
            }
          }).pipe(Effect.tapError((e) => Effect.logError(`Failed to read document with id ${id}: ${e.message}`)))
          return item
        })
      

    return {
      read: a,
      readAllDatabases,
      upsertDocument,
      readDocument,
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
