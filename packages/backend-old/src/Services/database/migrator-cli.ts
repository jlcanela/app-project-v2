import { Effect } from "effect";
import { migrateDatabase } from './migrator.js';
import { NodeContext, NodeRuntime } from '@effect/platform-node';

import { PgLive } from './pg-live.js';

export const program = migrateDatabase.pipe(
    Effect.provide([PgLive, NodeContext.layer]),
    Effect.orDie
)

NodeRuntime.runMain(program);