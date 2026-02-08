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

import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Schema } from "effect";

export const PartyId = Schema.UUID.pipe(Schema.brand("PartyId"));
export type PartyId = typeof PartyId.Type;

export const Role = Schema.Literal("admin", "project-manager", "developer", "external");
export type RoleType = typeof Role.Type;

// Example regex (choose stricter if you need)
const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;

export const emailSchema = Schema.String.pipe(
  Schema.filter((s) => emailRegex.test(s) || "must be a valid email", {
    jsonSchema: { format: "email" },
  }),
);

export const personFields = Schema.Struct({
  _tag: Schema.Literal("Person"),
  version: Schema.Literal(1),
  id: PartyId.annotations({
    title: "Party ID",
    arbitrary: makeArbitrary((_faker) => PartyId.make(faker.string.uuid())),
  }),
  firstName: Schema.String.annotations({
    title: "First Name",
    description: "First name of the user",
    arbitrary: makeArbitrary((fkr) => fkr.person.firstName()),
  }),
  lastName: Schema.String.annotations({
    title: "Last Name",
    description: "Last name of the user",
    arbitrary: makeArbitrary((fkr) => fkr.person.lastName()),
  }),
  email: emailSchema.annotations({
    title: "Email Address",
    description: "Email address of the user",
    arbitrary: makeArbitrary((fkr) => fkr.internet.email()),
  }),
  roles: Schema.Array(Role).annotations({
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
export class ProjectNotFoundError extends Schema.TaggedError<ProjectNotFoundError>(
  "PersonNotFoundError",
)(
  "PersontNotFoundError",
  { id: PartyId },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {
  get message() {
    return `Project with id ${this.id} not found`;
  }
}

export const partyIdParam = HttpApiSchema.param("id", Schema.String.pipe(Schema.brand("PartyId")));

export class PartyGroup extends HttpApiGroup.make("party")
  .add(
    HttpApiEndpoint.put("upsert", "/")
      .addSuccess(Person)
      .setPayload(UpsertPerson)
      .addError(ProjectNotFoundError),
  )
  .add(
    HttpApiEndpoint.del("delete", "/")
      .setPayload(
        Schema.Struct({
          id: PartyId,
        }),
      )
      .addSuccess(Schema.Void)
      .addError(ProjectNotFoundError),
  )
  .prefix("/party") {}

