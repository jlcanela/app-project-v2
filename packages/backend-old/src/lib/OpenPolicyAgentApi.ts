import { Data, Effect } from "effect"
import { FetchHttpClient, HttpBody, HttpClient, HttpClientRequest } from "@effect/platform"
import { FieldCondition, guard, type Condition } from "@ucast/mongo2js"
import { emptyCondition } from "./ucast.js"

export type ApiRequest = {
  resource: "projects" // | ... other resources
  access: "create" | "read" | "update" | "delete"
}

export type User = {
  id: string
  roles: Array<string>
}

export type Permission<T> = {
  apiRequest: ApiRequest
  condition: Condition<T>
}

export class OpaError extends Data.TaggedError("OpaError")<{
  message: string,
  status: number
}> {}

export class OpaConnexionError extends Data.TaggedError("OpaConnexionError")<{
  cause?: unknown
}> {}

export class OpaServerDownError extends Data.TaggedError("OpaServerDownError")<{}> {}

export class OpaInvalidResponseError extends Data.TaggedError("OpaInvalidResponseError")<{
  query?: Condition<unknown>
}> {}

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

        const response = yield* client.execute(request).pipe(
          Effect.catchAll((error) => {
            return new OpaConnexionError({ cause: error.cause})
          })
        )

        if (response.status !== 200) {
          return yield* new OpaError({ message: "", status: response.status })
        }

        const json = (yield* response.json) as {
          result: { query?: Condition<T> }
        }

        if (!json.result || !json.result.query) {
          return yield* new OpaInvalidResponseError({ query: json?.result as Condition<unknown>})
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
    }),
    dependencies: [FetchHttpClient.layer]
  }
) {
  static Test = new OpenPolicyAgentApi({
    fetchPermission: <T>(apiRequest: ApiRequest, user: User) => Effect.succeed<Permission<T>>({
      apiRequest: {
        resource: "projects",
        access: "read"
      },
      condition: {
        "field": "projects.owner",
        "operator": "eq",
        "type": "field",
        "value": "1234"
      } as unknown as Condition<T>
    })
  })
}

