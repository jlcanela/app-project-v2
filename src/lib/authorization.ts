import { HttpApiError, HttpApiMiddleware, HttpApiSecurity, OpenApi } from "@effect/platform";
import { Unauthorized } from "@effect/platform/HttpApiError";
import { Context, Data, Effect, Layer, Redacted, Schema } from "effect";
import { PartyId, Role } from "./parties.js";
import * as jose from "jose";
import { RoleType } from "./parties.js";

// eslint-disable-next-line no-use-before-define
export class CurrentUser extends Schema.Class<CurrentUser>("")({
  //readonly sessionId: string;
  userId: PartyId,
  roles: Schema.Array(Role),
  context: Schema.Record({ key: Schema.String, value: Schema.Any }),
  // readonly permissions: Set<Permission>;
}) { }

// Create a Context Tag for CurrentUser
export class CurrentUserTag extends Context.Tag("CurrentUserTag")<
  // eslint-disable-next-line no-use-before-define
  CurrentUserTag,
  CurrentUser
>() { }

// export class AuthParams extends Schema.Class<AuthParams>("AuthParams")({
//   id: PartyId,
// }) {}

// eslint-disable-next-line no-use-before-define
export class Authorization extends HttpApiMiddleware.Tag<Authorization>()("Authorization", {
  failure: Unauthorized,
  provides: CurrentUserTag,
  security: {
    myBearer: HttpApiSecurity.bearer.pipe(
      // Add a description to the security definition
      HttpApiSecurity.annotate(OpenApi.Description, "OAuth2 Bearer Token"),
    ),
  },
}) { }

export class InvalidToken extends Data.TaggedError("InvalidToken")<{
  error?: unknown
}> { }

export const AuthorizationLive = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    yield* Effect.log("creating Authorization middleware");
    //const security = yield* Security;
    // Return the security handlers for the middleware
    return {
      // Define the handler for the Bearer token
      // The Bearer token is redacted for security
      myBearer: (bearerToken) =>
        Effect.fn("Authorization.myBearer")(function* () {
          const payload = yield* Effect.tryPromise({
            try: async () => {
              const secret = new TextEncoder().encode(process.env.JWT_SECRET);
              const { payload } = await jose.jwtVerify(Redacted.value(bearerToken), secret, {
                issuer: "urn:example:issuer",
                audience: "urn:example:audience",
              });

              return payload
            },
            catch: (error) => new InvalidToken({ error })
          }).pipe(
            // TODO: use encryption to protect potentially sensitive bearer token
            Effect.tapErrorTag("InvalidToken", () => Effect.annotateCurrentSpan("invalidToken", Redacted.value(bearerToken))),
            Effect.catchTag("InvalidToken", () => new HttpApiError.Unauthorized()
          ))

          return CurrentUser.make({
            userId: PartyId.make(payload.sub as string),
            roles: payload.roles as ReadonlyArray<RoleType>,
            context: {},
          });
        })()
    };
  }),
);
