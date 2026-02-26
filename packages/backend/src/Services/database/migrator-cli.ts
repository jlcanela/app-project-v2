import { Effect, Layer, Path } from "effect";
import { NodeChildProcessSpawner, NodeRuntime, NodeFileSystem } from '@effect/platform-node';
import { migrateDatabase } from './migrator.js';
import { PgLive } from './pg-live.js';

const Live = Layer.provideMerge(
    NodeChildProcessSpawner.layer,
     Layer.mergeAll(
            Path.layer,
            NodeFileSystem.layer)
);

export const program = migrateDatabase.pipe(
    Effect.provide(Layer.mergeAll(PgLive)),
    Effect.orDie
).pipe(
    Effect.provide(Live)
)

NodeRuntime.runMain(program);
