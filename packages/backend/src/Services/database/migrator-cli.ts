import { Effect, Layer } from "effect";
import { migrateDatabase } from './migrator.js';
import { NodeRuntime } from '@effect/platform-node';

import { PgLive } from './pg-live.js';

export const program = migrateDatabase.pipe(
    Effect.provide(Layer.mergeAll(PgLive)),
    Effect.orDie
)

NodeRuntime.runMain(program);
