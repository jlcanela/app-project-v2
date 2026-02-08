import { expect, it } from "@effect/vitest"
import { Effect, Layer } from "effect"
import { OpenPolicyAgentApi } from "./OpenPolicyAgentApi.js"
import { FetchHttpClient } from "@effect/platform"

const OpenPolicyAgentApiLive = OpenPolicyAgentApi.Default
    .pipe(Layer.provide(FetchHttpClient.layer))

it.layer(OpenPolicyAgentApiLive, { timeout: "30 seconds" })("OpenPolicyAgentApi", (it) => {

    it.effect.skip("OpenPolicyAgentApi discovers permission", () => Effect.gen(function* () {
        const opa = yield* OpenPolicyAgentApi

        const perm = yield* opa.fetchPermission<{ owner: string }>(
            { resource: "projects", access: "read" },
            { id: "1234", roles: ["dev"] }
        )

        expect(perm.condition).toEqual({
            "field": "projects.owner",
            "operator": "eq",
            "type": "field",
            "value": "1234",
        })

    }))

})
