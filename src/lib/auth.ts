import { HttpApiEndpoint, HttpApiBuilder, HttpApiError, HttpApiGroup } from "@effect/platform";
import { Effect, Schema } from "effect";
import { PartyId } from "./parties.js";
import * as jose from "jose";

// eslint-disable-next-line no-use-before-define
export class AuthParams extends Schema.Class<AuthParams>("AuthParams")({
  id: PartyId,
}) {}

// eslint-disable-next-line no-use-before-define
export class JWT extends Schema.Class<JWT>("JWT")({
  accessToken: Schema.String,
}) {}

export const genToken =  (payload: AuthParams) =>
    Effect.tryPromise({
      try: async () => {
        const partyId = payload.id;

        // const party = findPartyById(partyId);
        // if (party === undefined) {
        //   throw new HttpApiError.NotFound(); //`Party with id ${partyId} not found`);
        // }

        const encoder = new TextEncoder();
        const secretKey = encoder.encode(process.env.JWT_SECRET);
        const jwt = await new jose.SignJWT({
          "urn:example:claim": true,
          given_name: "party.firstName",
          family_name: "party.lastName",
          roles: ["admin"],
        })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setSubject(partyId)
          .setIssuer("urn:example:issuer")
          .setAudience("urn:example:audience")
          .setExpirationTime("2h")
          .sign(secretKey);

        return JWT.make({
          accessToken: jwt,
        });
      },
      // remap the error
      catch: (_unknown) => {
        console.log(_unknown)
        return new HttpApiError.Forbidden();
      },
    });

