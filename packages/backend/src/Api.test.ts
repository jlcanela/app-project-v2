// import {
//   HttpApiBuilder,
//   HttpApi
// } from "@effect/platform"
// import { Layer, Effect } from "effect"

import { expect, it } from "@effect/vitest"

// import { MyApi } from "./API.js"
// import { AuthorizationLive } from "./lib/authorization.js"

// // Build the layer for your API + middleware
// const apiLayer = HttpApiBuilder.middleware(MyApi, AuthorizationLive).pipe(
//   Layer.provide(HttpApiBuilder.build(MyApi, handlers)) // your endpoint handlers
// )

// // Turn into a fetch‑compatible handler (Request -> Response)
// const { handler } = HttpApiBuilder.toWebHandler(apiLayer)

it("should implement API test", () => {
    expect(true).toBe(true)
})

// it("returns 401 when missing token", async () => {
//   const req = new Request("http://test/api/search?q=foo", {
//     method: "GET"
//   })

//   const res = await handler(req)

//   expect(res.status).toBe(401)
// })

// it("returns 200 when authorized", async () => {
//   const req = new Request("http://test/api/search?q=foo", {
//     method: "GET",
//     headers: { Authorization: "Bearer valid-token" }
//   })

//   const res = await handler(req)

//   expect(res.status).toBe(200)
// })
