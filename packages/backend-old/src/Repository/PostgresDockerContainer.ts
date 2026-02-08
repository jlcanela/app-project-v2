import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { Data, Effect } from "effect"

export class ContainerError extends Data.TaggedError("ContainerError")<{
  cause: unknown
}> {}

export class PostgresDockerContainer extends Effect.Service<PostgresDockerContainer>()("test/PostgresDockerContainer", {
  scoped: Effect.acquireRelease(
    Effect.tryPromise({
      try: () => new PostgreSqlContainer("postgres:18-bookworm").start(),
      catch: (cause) => {
        console.log(cause)  
        return new ContainerError({ cause })
      } 
    }),
    (container) => Effect.promise(() => container.stop())
  )
}) {}
