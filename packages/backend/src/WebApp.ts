import { FileSystem, HttpServerResponse } from "@effect/platform";
import { Router } from "@effect/platform/HttpApiBuilder";
import { Effect } from "effect";

const basePath = process.argv.slice(2)[0] ?? "dist";
const mailingPath = process.argv.slice(3)[0] ?? "dist";

const listFiles = (path: string) =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const files = yield* fs.readDirectory(path, { recursive: true });
    return files.filter((file) => file.includes("."));
  });

export const WebAppRoutes = Router.use((router) =>
  Effect.gen(function* () {
    yield* router.get(`/`, HttpServerResponse.file(`${basePath}/index.html`));
    const files = yield* listFiles(basePath);
    yield* Effect.log(`Serving files: ${files}`);
    for (const file of files) {
      yield* router.get(`/${file}`, HttpServerResponse.file(`${basePath}/${file}`));
    }
    // const mailingFiles = yield* listFiles(mailingPath);
    // for (const file of mailingFiles) {
    //   yield* Effect.log(`Serving mailing file: ${file}`);
    //   yield* router.get(
    //     `/modules/mailing/v1/${file}`,
    //     HttpServerResponse.file(`${mailingPath}/${file}`),
    //   );
    // }
  }).pipe(Effect.withSpan("webroute")),
);
