import { HttpApiError, HttpApiMiddleware, HttpApiSecurity, OpenApi } from "@effect/platform";
import { Unauthorized } from "@effect/platform/HttpApiError";
import { Context, Effect, Layer, Redacted, Schema } from "effect";
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
}) {}

// Create a Context Tag for CurrentUser
export class CurrentUserTag extends Context.Tag("CurrentUserTag")<
  // eslint-disable-next-line no-use-before-define
  CurrentUserTag,
  CurrentUser | null
>() {}

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
}) {}


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
        Effect.gen(function* () {
          const user = yield* Effect.tryPromise({
            try: async () => {
              const secret = new TextEncoder().encode(process.env.JWT_SECRET);
              const { payload } = await jose.jwtVerify(Redacted.value(bearerToken), secret, {
                issuer: "urn:example:issuer",
                audience: "urn:example:audience",
              });

              const id = payload.sub as string;
              const roles = payload.roles as ReadonlyArray<RoleType>;
            //   const context = security.evaluate(
            //     { search_entity: "project", user: { id, roles } },
            //     "search/allow",
            //   );

              return CurrentUser.make({
                userId: PartyId.make(payload.sub as string),
                roles: payload.roles as ReadonlyArray<RoleType>,
                context: {},
              });
            },
            catch: (err) => new HttpApiError.Unauthorized()//;new Error(`Invalid token: ${err}`),
          }).pipe(
            Effect.tap(Effect.log),
            //Effect.tapError((e) => Effect.log(e.message)),
            //Effect.orElseSucceed(() => null),
          );

          return user;
        }),
    };
  }),
);
