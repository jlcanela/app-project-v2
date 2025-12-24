//import { PgClient } from "@effect/sql-pg"
import { AzureCosmosDbEmulatorContainer } from "@testcontainers/azure-cosmosdb-emulator"
import { Data, Effect, Layer, pipe, Redacted, String } from "effect"

export class ContainerError extends Data.TaggedError("ContainerError")<{
  cause: unknown
}> {}

export class CosmosDbDockerContainer extends Effect.Service<CosmosDbDockerContainer>()("test/CosmosDbContainer", {
  scoped: Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new AzureCosmosDbEmulatorContainer("mcr.microsoft.com/cosmosdb/linux/azure-cosmos-emulator:vnext-EN20250228").start(),
      catch: (cause) => {
        console.log(cause)  
        return new ContainerError({ cause })
      } 
    }),
    (container) => Effect.promise(() => container.stop())
  )
}) {}

  // static CosmosDbConfigLive = Layer.unwrapEffect(
  //   Effect.gen(function*() {
  //     const container = yield* CosmosDbDockerContainer
  //     return container.getConnectionUri()
  //     //return {
  //     //  url: Redacted.make(container.getConnectionUri())
  //   })
    //.pipe(Layer.provide(this.Default)
  
//      )
  //    const client = new CosmosClient(connectionParams)
  //   static ClientLive = Layer.unwrapEffect(
//   static ClientLive = Layer.unwrapEffect(
//     Effect.gen(function*() {
//       const container = yield* PgContainer
//       return PgClient.layer({
//         url: Redacted.make(container.getConnectionUri())
//       })
//     })
//   ).pipe(Layer.provide(this.Default))

//   static ClientTransformLive = Layer.unwrapEffect(
//     Effect.gen(function*() {
//       const container = yield* PgContainer
//       return PgClient.layer({
//         url: Redacted.make(container.getConnectionUri()),
//         transformResultNames: String.snakeToCamel,
//         transformQueryNames: String.camelToSnake
//       })
//     })
//   ).pipe(Layer.provide(this.Default))

