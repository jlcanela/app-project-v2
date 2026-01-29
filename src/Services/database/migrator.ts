import { PgMigrator } from '@effect/sql-pg';
import { fileURLToPath } from "url"
import { Effect } from "effect";
import * as path from "node:path";

//import { NodeContext, NodeRuntime } from '@effect/platform-node';
//import { PgLive } from './pg-live.js';

export const migrateDatabase = Effect.gen(function* () {
    const currentDir = fileURLToPath(
        new URL(".", import.meta.url),
    );

    const migrations = yield* PgMigrator.run({
        loader: PgMigrator.fromFileSystem(
            path.join(currentDir, "migrations"),
        ),
        schemaDirectory: path.join(currentDir, "migrations"),
    });

    if (migrations.length > 0) {
        yield* Effect.logInfo(
            `${migrations.length} migrations applied`,
        );
        for (const [id, name] of migrations) {
            yield* Effect.logInfo(`${id} ${name}`)
        }
    } else {
        yield* Effect.logInfo("No migrations applied");
    }
})


//export const program = migrateDatabase.pipe(
//    Effect.provide([PgLive, NodeContext.layer]),
//    Effect.orDie
//)

//NodeRuntime.runMain(program);
