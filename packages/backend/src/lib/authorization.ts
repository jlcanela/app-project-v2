import {
  HttpApiError,
  HttpApiMiddleware,
  HttpApiSecurity,
  OpenApi,
} from "effect/unstable/httpapi"
import { Unauthorized } from "effect/unstable/httpapi/HttpApiError"
import {
  Data,
  Effect,
  Layer,
  Redacted,
  Schema,
  ServiceMap,
} from "effect"
import * as jose from "jose"
import { HttpServerResponse } from "effect/unstable/http" 

import { PartyId, Role } from "./parties.js"
import type { RoleType } from "./parties.js"

// eslint-disable-next-line no-use-before-define
export class CurrentUser extends Schema.Class<CurrentUser>("CurrentUser")(Schema.Struct({
  userId: PartyId,
  roles: Schema.Array(Role),
  context: Schema.Record(Schema.String, Schema.Any),
})) {}

export class User extends ServiceMap.Service<User>()("User", {
  make: Effect.fn(function* (currentUser: typeof CurrentUser.Type) {
    yield* Effect.yieldNow
    return { 
      currentUser: () => new CurrentUser({ userId: 1, roles: [], context: {}})
    } as const
  })

}) {}

// HttpApiMiddleware.Service<Id, Config>
// Config: { provides, error }
export class Authorization extends HttpApiMiddleware.Service<
  Authorization,
  { provides: User }
>()("Authorization", {
  error: Unauthorized,
  security: {
    myBearer: HttpApiSecurity.bearer.pipe(
      HttpApiSecurity.annotate(
        OpenApi.Description,
        "OAuth2 Bearer Token",
      ),
    ),
  },
}) {}

export class InvalidToken extends Data.TaggedError("InvalidToken")<{
  error?: unknown
}> {}

interface JwtPayload {
  sub: string
  roles: ReadonlyArray<RoleType>
  [k: string]: unknown
}

export const AuthorizationLive = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    yield* Effect.log("creating Authorization middleware")

    return {
      myBearer: (httpEffect, { credential }) =>
        Effect.gen(function* () {
          const payload = yield* Effect.tryPromise({
            try: async () => {
              const secret = new TextEncoder().encode(process.env.JWT_SECRET)
              const { payload } = await jose.jwtVerify(
                Redacted.value(credential),
                secret,
                {
                  issuer: "urn:example:issuer",
                  audience: "urn:example:audience",
                },
              )

              return payload as JwtPayload
            },
            catch: (error) => new InvalidToken({ error }),
          }).pipe(
            Effect.tapErrorTag("InvalidToken", () =>
              Effect.annotateCurrentSpan(
                "invalidToken",
                Redacted.value(credential),
              ),
            ),
          )

          const userService = User.make(new CurrentUser({
                  userId: PartyId.make(payload.sub),
                  roles: payload.roles as Array<RoleType>,
                  context: {},
                }))

          return yield* httpEffect.pipe(
            Effect.provideService(User, yield* userService)
          )
        }).pipe(
          Effect.catchTag("InvalidToken", () =>
            Effect.fail(new HttpApiError.Unauthorized()),
          ),
        ),
    }
  }),
)

