import { Schema } from "effect"
import * as Effect from "effect/Effect"
import { Issue, Issues, ProjectInvalidStatus, ProjectRequestStatus, ProjectValidStatus } from "../Domain/Project.js";
import fs from 'fs';
import path from "path"
import { ZenEngine, ZenEngineResponse, ZenEvaluateOptions } from "@gorules/zen-engine";
import { ProjectRequest } from "../Repository/ProjectRequestRepository.js";
import { ParseError } from "effect/ParseResult";

// Decoder: unknown -> Issues (Issue[])
export const decodeGoRulesIssues = (input: unknown) =>
    Effect.gen(function* () {
        const raw = yield* Schema.decodeUnknown(Schema.Array(Schema.Struct({ issue: Issue })))(input)
        const issues: Issues = raw.map((e) => e.issue)
        return issues
    }).pipe(
        Effect.catchTag("ParseError", (error) => Effect.fail(new InvalidBusinessRuleResult({ error })))
    )

export class InvalidBusinessRuleResult extends Schema.TaggedError<InvalidBusinessRuleResult>()(
    "InvalidBusinessRuleResult",
    {
        error: Schema.Unknown,
    },
) { }

export class RepositoryError extends Schema.TaggedError<RepositoryError>()(
    "RepositoryError",
    {
        error: Schema.Unknown,
    },
) { }

export const identity = <X>(x: X): X => x

export class RuleDefinition<IE, ID, O, T> {
  constructor(
    readonly name: string,
    readonly file: string,
    readonly version: number,
    readonly decision: boolean,
    readonly inputSchema: Schema.Schema<IE, ID>,   // Effect schema for input
    readonly outputSchema: Schema.Schema<O>,  // Effect schema for raw output
    readonly customizeData: (raw: O) => T,
  ) {}
}

const makeRule = <
  IE,
  ID,
  O,
  T = O,
>(args: {
  name: string
  file: string
  version: number
  decision: boolean
  inputSchema: Schema.Schema<IE, ID>
  outputSchema: Schema.Schema<O>
  customizeData?: (raw: O) => T
}) =>
  new RuleDefinition<IE, ID, O, T>(
    args.name,
    args.file,
    args.version,
    args.decision,
    args.inputSchema,
    args.outputSchema,
    (args.customizeData ?? ((x: O) => x as O)) as (raw: O) => T,
  )

const validateProjectInputSchema = Schema.Struct({ project: ProjectRequest })
const validateProjectOutputSchema = Schema.Array(Schema.Struct({ issue: Issue }))
const validateProjectRule = makeRule({
    name: "validateProject",
    file: './src/Services/project_validation_19.json',
    version: 19,
    decision: false,
    inputSchema: validateProjectInputSchema,
    outputSchema: validateProjectOutputSchema,
    customizeData: (raw) => {
        if (raw.length === 0) {
            return new ProjectValidStatus()
        } else {
            return new ProjectInvalidStatus({ issues: raw.map((e) => e.issue) })
        }
    }
})


export class BusinessRuleService extends Effect.Service<BusinessRuleService>()("app/BusinessRuleService", {
    effect: Effect.gen(function* () {

        //type RuleConfig = RuleDefinition<unknown, unknown, unknown, unknown>[]
        type AnyRule = RuleDefinition<any, any, any, any>
        const cfg: AnyRule[] = [validateProjectRule]

        const engine = new ZenEngine();

        type Rules = {
            [key: string]: {
                version: number;
                inputSchema: Schema.Schema<any>;
                outputSchema: Schema.Schema<any>;
                execute: (context: any, opts?: ZenEvaluateOptions | null | undefined) => Effect.Effect<unknown, unknown, never>
            }
        }

        const loadRules: (config:  RuleDefinition<unknown, unknown, unknown, unknown>[]) => Rules = (config) => {
            const rules: Rules = {}

            for (const cfg of config) {
                // read file content
                const content = fs.readFileSync(path.resolve(cfg.file))

                // create decision for this rule file
                const decision = engine.createDecision(content)

                // derive version: explicit or from file name (e.g. _19.json)
                const version =
                    cfg.version ??
                    (() => {
                        const match = cfg.file.match(/_(\d+)\.json$/)
                        return match ? Number(match[1]) : 1
                    })()

                // store wrapper that evaluates the decision
                rules[cfg.name] = {
                    version,
                    inputSchema: cfg.inputSchema,
                    outputSchema: cfg.outputSchema,
                    execute: (input: unknown) => Effect.gen(function* () {
                        const encoded = yield* Schema.encodeUnknown(rules[cfg.name].inputSchema)(input)
                        const result = (yield* Effect.promise(() => decision.evaluate(encoded))).result
                        const decoded = yield* Schema.decodeUnknown(rules[cfg.name].outputSchema)(result)
                        return cfg.customizeData ? cfg.customizeData(decoded) : decoded                       
                    })
                }
            }

            return rules
        }

        const rules = loadRules(cfg);

        const execRules = (ruleName: string) => Effect.fn("executeProjectValidationRules")(function* (input: unknown) {
           return yield* rules[ruleName].execute(input)          
        })

        return {
            validateProjectRequest: execRules("validateProject") as  (input: unknown) => Effect.Effect<ProjectRequestStatus, ParseError | InvalidBusinessRuleResult, never>,
        };
    }),
    dependencies: []
}) { }

