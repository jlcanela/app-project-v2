import { defineConfig } from "tsdown"
import pkg from "./package.json" with { type: "json" }

export default defineConfig({
  entry: "src/index.ts",
  outDir: "dist",
  treeshake: true,
  inlineOnly: false,
  format: ["esm"],
  noExternal: [
  ...Object.keys(pkg.dependencies ?? {}),
  //...Object.keys(pkg.peerDependencies ?? {}),
],
 external: [
    "@libsql/client",
    "graphql"
  //  "libsql", // if you use the older package
  ],
})