import { loadPolicy } from "@open-policy-agent/opa-wasm";
import { Effect, Option, Sink, Stream } from "effect";
import * as fs from "fs";
import { type Readable } from "stream";
import * as tar from "tar-stream";
import * as zlib from "zlib";

export type UserInput = {
  id: string;
  roles: ReadonlyArray<string>;
};

export type PolicyInput = {
  user: UserInput;
  search_entity: string;
};

export type Feature =
  | "about"
  | "project"
  | "admin"
  | "communication"
  | "party"
  | "config"
  | "template";
export type Action = "create" | "read" | "update" | "delete";
export type SecurityContext = Record<Feature, Array<Action>>;

type TarEntry = {
  header: tar.Headers;
  content: Buffer;
};

/**
 * Creates an Effect stream that emits each entry from a tar archive.
 *
 * Each emitted item is a { header, content } object.
 */
export const extractBundle = (bundlePath: string): Stream.Stream<TarEntry, Error> =>
  Stream.async<TarEntry, Error>((emit) => {
    const extract = tar.extract();

    extract.on("entry", (header, stream, next) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk: Buffer) => chunks.push(chunk));
      stream.on("end", () => {
        void emit.single({ header, content: Buffer.concat(chunks) });
        next();
      });
      stream.resume();
    });

    extract.on("finish", () => void emit.end());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    extract.on("error", (err) => void emit.fail(err));

    let stream: Readable = fs.createReadStream(bundlePath);
    // If the path ends with .gz or .tgz, decompress
    if (bundlePath.endsWith(".gz") || bundlePath.endsWith(".tgz")) {
      stream = stream.pipe(zlib.createGunzip());
    }

    stream.pipe(extract);

    // Optional cleanup
    return Effect.sync(() => extract.destroy());
  });

// eslint-disable-next-line no-use-before-define
export class Security extends Effect.Service<Security>()("app/Security", {
  effect: Effect.gen(function* () {
    yield* Effect.log("Loading OPA policy from WASM file");

    const DataFile = "/data.json";
    const PolicyFile = "/policy.wasm";

    const files = [DataFile, PolicyFile] as const;
    type Filename = (typeof files)[number];

    const extractFiles = Effect.fn(function* (
      bundlePath: string,
      targetFiles: ReadonlyArray<Filename>,
    ) {
      const stream = extractBundle(bundlePath).pipe(
        Stream.filter(({ header }) => targetFiles.includes(header.name as Filename)),
      );

      // Fold over the stream and accumulate results into a Record<string, Buffer>
      const fileMap = yield* Stream.run(
        stream,
        Sink.fold<Partial<Record<Filename, Buffer>>, TarEntry>(
          {}, // initial accumulator
          () => true, // always continue folding
          (acc, { content, header }) => {
            acc[header.name as unknown as Filename] = content;
            return acc;
          },
        ),
      );

      return fileMap;
    });

    //const p1 = "/home/jlcanela/dev/mailing-pro/opa/bundle.tar.gz";
    const p2 = "opa/project/bundle.tar.gz";
    const allFiles = yield* extractFiles(p2, files);

    const { [DataFile]: dataBytesOrEmpty, [PolicyFile]: wasmBytesOrEmpty } = allFiles;

    const dataBytes = yield* Option.fromNullable(dataBytesOrEmpty).pipe(
      Effect.orElseFail(() => new Error(`missing ${DataFile} as data.json`)),
    );

    const wasmBytes = yield* Option.fromNullable(wasmBytesOrEmpty).pipe(
      Effect.orElseFail(() => new Error(`missing ${PolicyFile} as policy.wasm`)),
    );

    const policy = yield* Effect.tryPromise({
      try: async () => {
        //const wasmBytes: ArrayBuffer = await readFile("./ui_policy.wasm");
        const module = await WebAssembly.compile(wasmBytes);
        const loadedPolicy = await loadPolicy(module);

        const json = dataBytes.toString("utf8");
        const data = JSON.parse(json) as object;
        loadedPolicy.setData(data);

        return loadedPolicy;
      },
      catch: (err) =>
        new Error(`Failed to load OPA policy: ${err instanceof Error ? err.message : String(err)}`),
    });

    const entryPoints = policy.entrypoints as Record<string, number>;
    yield* Effect.log("entryPoints", entryPoints);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const evaluate = (pi: PolicyInput, policyName: string) =>
      policy.evaluate(pi, entryPoints[policyName])[0].result as SecurityContext;

    return {
      evaluate,
    } as const;
  }),
}) {}

