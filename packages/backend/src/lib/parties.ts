// Perplexity’s response to which user model to use for a SaaS application:

// Human Resource Management System (HRMS)
// - internal users

// IAM (Identity and Access Management)
// - external users (contractors, freelancers, partners)

// Identified users
// - have an ID in the system
// - can be created by an administrator
// - cannot be authenticated with Magic Link
// - must use 2FA (two-factor authentication) for sensitive actions

// User
// - first name
// - last name
// - email
// - role (admin, user, guest)
// - identifier (ID)

// AuthenticatedUser
// - authentified by auth system

// IdentifiedUser
// - declared in the system with an ID
// - authentication

import { faker } from "@faker-js/faker";
import { makeArbitrary } from "./arbitrary-helper.js";

import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import { Schema } from "effect";

export const PartyId = Schema.String.check(Schema.isUUID(8)).pipe(Schema.brand("PartyId"));
export type PartyId = typeof PartyId.Type;

export const Role = Schema.Literals(["admin", "project-manager", "developer", "external"]);
export type RoleType = typeof Role.Type;

/**
 * Make it easy to plug a Faker generator into a Schema's `arbitrary` override.
 * The seed comes from Fast-Check so data is reproducible and shrinks correctly.
 */
function fake<A>(
  gen: (f: typeof faker, ctx: SchemaAnnotations.Arbitrary.Context) => A
): SchemaAnnotations.Arbitrary.ToArbitrary<A, readonly []> {
  return () => (fc, ctx) =>
    fc.nat().map((seed) => {
      faker.seed(seed)
      return gen(faker, ctx)
    })
}

// Example regex (choose stricter if you need)
const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

export const emailSchema = Schema.String.check(
  Schema.makeFilter((s) => emailRegex.test(s) || "must be a valid email", {
    jsonSchema: { format: "email" },
  }),
);


export const personFields = Schema.Struct({
  _tag: Schema.Literal("Person"),
  version: Schema.Literal(1),
  id: PartyId.annotate({
    title: "Party ID",
    arbitrary: makeArbitrary((_faker) => PartyId.makeUnsafe(faker.string.uuid())),
  }),
  firstName: Schema.String.annotate({
    title: "First Name",
    description: "First name of the user",
    arbitrary: makeArbitrary((fkr) => fkr.person.firstName()),
  }),
  lastName: Schema.String.annotate({
    title: "Last Name",
    description: "Last name of the user",
    arbitrary: makeArbitrary((fkr) => fkr.person.lastName()),
  }),
  email: emailSchema.annotate({
    title: "Email Address",
    description: "Email address of the user",
    arbitrary: makeArbitrary((fkr) => fkr.internet.email()),
  }),
  roles: Schema.Array(Role).annotate({
    title: "User Role",
    description: "Role of the user in the system",
    arbitrary: makeArbitrary((fkr) => [
      fkr.helpers.arrayElement(["admin", "project-manager", "developer", "external"] as const),
    ]),
  }),
});

// eslint-disable-next-line no-use-before-define
export class Person extends Schema.Class<Person>("User")(personFields) {}

export type PersonType = typeof Person.Type;

export const upsertPersonFields = Schema.Struct({
  ...personFields.fields,
  id: Schema.optional(PartyId),
});

// eslint-disable-next-line no-use-before-define
export class UpsertPerson extends Schema.Class<UpsertPerson>("UpsertProjectPayload_V1")(
  upsertPersonFields,
) {}

// eslint-disable-next-line no-use-before-define
export class ProjectNotFoundError extends Schema.TaggedErrorClass<ProjectNotFoundError>(
  "PersonNotFoundError",
)(
  "PersontNotFoundError",
  { id: PartyId },
  // HttpApiSchema.annotate({
  //   status: 404,
  // }),
) {
  get message() {
    return `Project with id ${this.id} not found`;
  }
}

//export const partyIdParam = HttpApiSchema.param("id", Schema.String.pipe(Schema.brand("PartyId")));
const partyIdParam = {
  "id": Schema.String.pipe(Schema.brand("PartyId"))
}

export class PartyGroup extends HttpApiGroup.make("party")
  .add(
    HttpApiEndpoint.put("upsert", "/", {
      success: Person,
      payload: UpsertPerson,
      error: ProjectNotFoundError
    }))
  .add(
    HttpApiEndpoint.delete("delete", "/", {
      success: Schema.Void,
      params: partyIdParam,
      error: ProjectNotFoundError
    }))
  .add(
    HttpApiEndpoint.get("get", "/:id", {
      success: Person,
       params: partyIdParam,
       error: ProjectNotFoundError
     }))
  .prefix("/party") {}

