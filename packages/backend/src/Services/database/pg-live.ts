import { PgClient } from "@effect/sql-pg"
import { Config, Effect, Layer, Redacted } from "effect"
import * as String from "effect/String";
import { PostgresDockerContainer } from "../../Repository/PostgresDockerContainer.js";
import { CustomTypesConfig } from "pg"
import pgTypes from 'pg-types'

const customTypes: CustomTypesConfig = {
  getTypeParser: (oid, format: any) => {
    switch (oid) {
      case 1700: {
        // NUMERIC -> JS number
        return (value: string) => Number(value)
      }

      case 114:  // json
      case 3802: // jsonb
        return (value: string) => value

      case 1082: // date
      case 1114: // timestamp without tz
      case 1184: // timestamp with tz
        return (value: string) => value
        
      default:
        return pgTypes.getTypeParser(oid, format)
    }
  },
}

export const pgConfig = {
    transformQueryNames: String.camelToSnake,
    transformResultNames: String.snakeToCamel,
    types: customTypes
} as const;

export const makePgLayer = (url: string) =>
  PgClient.layer({
    url: Redacted.make(url),
    ...pgConfig,
  }).pipe(
    Layer.orDie,
)

export const PgLive = Layer.unwrap(
    Effect.gen(function*(){
        const url = yield* Config.string("DATABASE_URL")
        return makePgLayer(url)
    })
)

export const PgTest = Layer.unwrap(
  Effect.gen(function* () {
    const container = yield* PostgresDockerContainer // service
    const url = container.getConnectionUri()
    return makePgLayer(url)
  }),
)
