import { Effect } from "effect"
import { HttpBody, HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform"
import type { Condition } from "@ucast/mongo2js"

type ApiRequest = {
  resource: "projects" // | ... other resources
  access: "create" | "read" | "update" | "delete"
}

type User = {
  id: string
  roles: Array<string>
}

type Permission<T> = {
  apiRequest: ApiRequest
  condition: Condition<T>
}


export class OpenPolicyAgentApi extends Effect.Service<OpenPolicyAgentApi>()(
  "app/OpenPolicyAgentApi",
  {
    effect: Effect.gen(function* () {
      const baseClient = yield* HttpClient.HttpClient

      const client = baseClient.pipe(
        HttpClient.mapRequest(
          HttpClientRequest.prependUrl("http://localhost:8181") // opaUrl
        )
      )

      const fetchPermission = <T>(
        apiRequest: ApiRequest,
        user: User
      ) => Effect.gen(function* () {
          // Build OPA input from apiRequest + user
          const body = {
            input: {
              user
            }
          }

          const { resource, access } = apiRequest
          const request = HttpClientRequest.post(`/v1/compile/${resource}/${access}`, {
            headers: {
              "Accept": "application/vnd.opa.ucast.all+json",
            },
            body: HttpBody.raw(JSON.stringify(body), {
                contentType: "application/json"
            })
          })
        
          const response = yield* client.execute(request)

          if (response.status !== 200) {
            return yield* Effect.fail(
              new Error(`OPA error: ${response.status}`)
            )
          }

          const json = (yield* response.json) as {
            result?: { query?: Condition<T> }
          }

          if (!json.result || !json.result.query) {
            return yield* Effect.fail(
              new Error("OPA response missing result.query")
            )
          }

          const condition = json.result.query

          const permission: Permission<T> = {
            apiRequest,
            condition
          }

          return permission
        })

      return {
        fetchPermission
      } as const
    })
  }
) {}

