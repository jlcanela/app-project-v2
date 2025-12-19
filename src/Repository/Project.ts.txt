import { Schema } from "effect";
import { makeArbitrary } from "../../lib/arbitrary-helper.js";
import { PartyId } from "../parties/index.js";

// -----------------------------------------------------------------------------
// Reusable literals
// -----------------------------------------------------------------------------

export const ProjectStatusV3 = Schema.Literal("Draft", "Active", "Completed", "In Progress");
export type ProjectStatusV3 = Schema.Schema.Type<typeof ProjectStatusV3>;

export const TaskStatus = Schema.Literal("To Do", "In Progress", "Done");
export const TaskPriority = Schema.Literal("Low", "Medium", "High");

export const RiskProbability = Schema.Literal("Low", "Medium", "High");
export const RiskImpact = Schema.Literal("Low", "Medium", "High");

// -----------------------------------------------------------------------------
// Value objects (can be reused in multiple satellites)
// -----------------------------------------------------------------------------

export const Milestone = Schema.Struct({
  milestoneId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => `M${faker.number.int({ min: 1, max: 999 })}`),
  }),
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.company.buzzVerb() + " " + faker.company.buzzNoun()),
  }),
  date: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.future().toISOString().slice(0, 10)),
  }),
});
export type Milestone = Schema.Schema.Type<typeof Milestone>;

export const Task = Schema.Struct({
  taskId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => `T${faker.number.int({ min: 1, max: 999 })}`),
  }),
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.commerce.productName()),
  }),
  assignedTo: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.internet.username()),
  }),
  priority: TaskPriority,
  status: TaskStatus,
  dueDate: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.future().toISOString().slice(0, 10)),
  }),
  // Conceptually link-like, but kept as value for now
  dependencies: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => `T${faker.number.int({ min: 1, max: 999 })}`),
    }),
  ),
  comments: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.lorem.sentence()),
    }),
  ),
  attachments: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.system.fileName()),
    }),
  ),
});
export type Task = Schema.Schema.Type<typeof Task>;

export const Resource = Schema.Struct({
  resourceId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.person.fullName()),
  }),
  skillSet: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.hacker.noun()),
    }),
  ),
  availability: Schema.Literal("Full-time", "Part-time").annotations({
    arbitrary: makeArbitrary((faker) => faker.helpers.arrayElement(["Full-time", "Part-time"])),
  }),
  // Conceptually “assignments” would be a link; kept as value for now
  assignments: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => `T${faker.number.int({ min: 1, max: 999 })}`),
    }),
  ),
});
export type Resource = Schema.Schema.Type<typeof Resource>;

export const ProjectDocument = Schema.Struct({
  documentId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.system.fileName()),
  }),
  version: Schema.String.annotations({
    arbitrary: makeArbitrary(
      (faker) => `${faker.number.int({ min: 1, max: 10 })}.${faker.number.int({ min: 0, max: 9 })}`,
    ),
  }),
  uploadedBy: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.internet.username()),
  }),
  lastModified: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.past().toISOString().slice(0, 10)),
  }),
});
export type ProjectDocument = Schema.Schema.Type<typeof ProjectDocument>;

export const Workflow = Schema.Struct({
  workflowId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.company.buzzPhrase()),
  }),
  steps: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.hacker.verb()),
    }),
  ),
  automationRules: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.hacker.phrase()),
    }),
  ),
});
export type Workflow = Schema.Schema.Type<typeof Workflow>;

export const Risk = Schema.Struct({
  riskId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  description: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.lorem.sentence()),
  }),
  probability: RiskProbability,
  impact: RiskImpact,
  mitigationPlan: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.lorem.sentence()),
  }),
});
export type Risk = Schema.Schema.Type<typeof Risk>;

export const Expense = Schema.Struct({
  expenseId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  description: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.commerce.productName()),
  }),
  amount: Schema.Number.annotations({
    arbitrary: makeArbitrary((faker) =>
      faker.number.float({ min: 0, max: 100_000, fractionDigits: 2 }),
    ),
  }),
});
export type Expense = Schema.Schema.Type<typeof Expense>;

export const Budget = Schema.Struct({
  totalBudget: Schema.Number.annotations({
    arbitrary: makeArbitrary((faker) =>
      faker.number.float({ min: 1000, max: 1_000_000, fractionDigits: 0 }),
    ),
  }),
  currency: Schema.Literal("USD", "EUR", "GBP").annotations({
    arbitrary: makeArbitrary((faker) => faker.helpers.arrayElement(["USD", "EUR", "GBP"])),
  }),
  expenses: Schema.Array(Expense),
});
export type Budget = Schema.Schema.Type<typeof Budget>;

export const Integration = Schema.Struct({
  tool: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.company.name()),
  }),
  connected: Schema.Boolean,
  channels: Schema.optional(
    Schema.Array(
      Schema.String.annotations({
        arbitrary: makeArbitrary((faker) => faker.lorem.word()),
      }),
    ),
  ),
  repo: Schema.optional(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.lorem.word()),
    }),
  ),
});
export type Integration = Schema.Schema.Type<typeof Integration>;

export const Timesheet = Schema.Struct({
  userId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  taskId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => `T${faker.number.int({ min: 1, max: 999 })}`),
  }),
  date: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.past().toISOString().slice(0, 10)),
  }),
  hours: Schema.Number.annotations({
    arbitrary: makeArbitrary((faker) => faker.number.int({ min: 1, max: 12 })),
  }),
  billable: Schema.Boolean,
});
export type Timesheet = Schema.Schema.Type<typeof Timesheet>;

export const CustomFields = Schema.Struct({
  client: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.company.name()),
  }),
  projectType: Schema.Literal("External", "Internal").annotations({
    arbitrary: makeArbitrary((faker) => faker.helpers.arrayElement(["External", "Internal"])),
  }),
  customKPI: Schema.optional(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => faker.company.buzzPhrase()),
    }),
  ),
});
export type CustomFields = Schema.Schema.Type<typeof CustomFields>;

export const Notification = Schema.Struct({
  notificationId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  type: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.hacker.abbreviation()),
  }),
  recipient: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.internet.username()),
  }),
  timestamp: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.recent().toISOString()),
  }),
});
export type Notification = Schema.Schema.Type<typeof Notification>;

export const Portfolio = Schema.Struct({
  portfolioId: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.string.uuid()),
  }),
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.company.name()),
  }),
  projects: Schema.Array(
    Schema.String.annotations({
      arbitrary: makeArbitrary((faker) => `PRJ-${faker.number.int({ min: 100, max: 999 })}`),
    }),
  ),
  aggregateKPIs: Schema.Struct({
    totalBudget: Schema.Number.annotations({
      arbitrary: makeArbitrary((faker) =>
        faker.number.float({ min: 0, max: 1_000_000, fractionDigits: 0 }),
      ),
    }),
    activeProjects: Schema.Number.annotations({
      arbitrary: makeArbitrary((faker) => faker.number.int({ min: 1, max: 10 })),
    }),
  }),
});
export type Portfolio = Schema.Schema.Type<typeof Portfolio>;

// -----------------------------------------------------------------------------
// Project model using Entity + Satellite concepts
// -----------------------------------------------------------------------------

// Business Entity (hub-like)
// This is what would correspond to the "project" table's core columns.
export const ProjectEntity = Schema.Struct({
  _tag: Schema.Literal("Project"),
  id: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => `PRJ-${faker.number.int({ min: 100, max: 999 })}`),
  }),
  ownerId: PartyId,
  // conceptual version of the whole project model
  version: Schema.Literal(3),
});
export type ProjectEntity = Schema.Schema.Type<typeof ProjectEntity>;

// Satellite: core project info (name/description/dates/status)
export const ProjectCoreSatellite = Schema.Struct({
  name: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.commerce.productAdjective() + " Project"),
  }),
  description: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.company.catchPhrase()),
  }),
  startDate: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.past().toISOString().slice(0, 10)),
  }),
  endDate: Schema.String.annotations({
    arbitrary: makeArbitrary((faker) => faker.date.future().toISOString().slice(0, 10)),
  }),
  status: ProjectStatusV3,
});
export type ProjectCoreSatellite = Schema.Schema.Type<typeof ProjectCoreSatellite>;

// Satellite: planning & structure
export const ProjectPlanningSatellite = Schema.Struct({
  milestones: Schema.Array(Milestone),
  tasks: Schema.Array(Task),
  workflows: Schema.Array(Workflow),
});
export type ProjectPlanningSatellite = Schema.Schema.Type<typeof ProjectPlanningSatellite>;

// Satellite: execution & resources
export const ProjectExecutionSatellite = Schema.Struct({
  resources: Schema.Array(Resource),
  timesheets: Schema.Array(Timesheet),
});
export type ProjectExecutionSatellite = Schema.Schema.Type<typeof ProjectExecutionSatellite>;

// Satellite: documentation & risk & budget
export const ProjectGovernanceSatellite = Schema.Struct({
  documents: Schema.Array(ProjectDocument),
  risks: Schema.Array(Risk),
  budget: Budget,
});
export type ProjectGovernanceSatellite = Schema.Schema.Type<typeof ProjectGovernanceSatellite>;

// Satellite: integrations & notifications & custom fields & portfolio relation
// (in a later phase, portfolio membership would likely be a dedicated Link)
export const ProjectAuxiliarySatellite = Schema.Struct({
  integrations: Schema.Array(Integration),
  customFields: CustomFields,
  notifications: Schema.Array(Notification),
  portfolio: Portfolio,
});
export type ProjectAuxiliarySatellite = Schema.Schema.Type<typeof ProjectAuxiliarySatellite>;

// Convenience: "aggregate view" close to old ProjectV3, for app-facing API
export const ProjectV3 = Schema.Struct({
  entity: ProjectEntity,
  core: ProjectCoreSatellite,
  planning: ProjectPlanningSatellite,
  execution: ProjectExecutionSatellite,
  governance: ProjectGovernanceSatellite,
  auxiliary: ProjectAuxiliarySatellite,
});
export type ProjectTypeV3 = Schema.Schema.Type<typeof ProjectV3>;

