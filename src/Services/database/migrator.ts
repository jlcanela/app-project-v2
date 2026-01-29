import { PgMigrator } from '@effect/sql-pg';
import { fileURLToPath } from "url"
import { Effect } from "effect";
import * as path from "node:path";

const isCi = process.env.CI === "true" || process.env.NODE_ENV === "test"

export const migrateDatabase = Effect.gen(function* () {
    const currentDir = fileURLToPath(
        new URL(".", import.meta.url),
    );

    const migrationsDir = path.join(currentDir, "migrations")

    const migrations = yield* PgMigrator.run({
        loader: PgMigrator.fromFileSystem(migrationsDir),
        schemaDirectory: migrationsDir,
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
