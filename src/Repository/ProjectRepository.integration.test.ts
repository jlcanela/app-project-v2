
import { describe, expect, it } from "@effect/vitest"
import { SqlClient, SqlSchema } from "@effect/sql"
import { Effect, Layer, Schema } from "effect"
import * as Option from "effect/Option"
import { NodeContext } from "@effect/platform-node"
import { PostgresDockerContainer } from "./PostgresDockerContainer.js"
import { PgTest } from "../Services/database/pg-live.js"
import { migrateDatabase } from "../Services/database/migrator.js"
import { ProjectForm, ProjectId, ProjectRequest, ProjectRequestFormSchema, ProjectRequestRepository } from "./ProjectRequestRepository.js"

const MigrationLayer = Layer.unwrapEffect(Effect.gen(function* () {
    yield* migrateDatabase
    return Layer.empty
}))

const MigrationDepsLayer = Layer.mergeAll(
    PgTest.pipe(Layer.provide(PostgresDockerContainer.Default)),                          // layer depending on PostgresDockerContainer
    NodeContext.layer,
)

const TestLayerWithMigration = Layer.mergeAll(MigrationLayer, ProjectRequestRepository.Default).pipe(Layer.provideMerge(MigrationDepsLayer))

it.layer(TestLayerWithMigration, { timeout: "30 seconds" })("Project Repository SQL Tests", (it) => {

    it.effect("migrations should have been executed", () =>
        Effect.gen(function* () {

            const sql = yield* SqlClient.SqlClient

            const testSql = SqlSchema.findAll({
                Request: Schema.Void,
                Result: Schema.Struct({ schemaname: Schema.String, tablename: Schema.String }),
                execute: () => sql`SELECT schemaname, tablename
FROM pg_catalog.pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');`,
            })

            const result = yield* testSql()
            expect(result.map((row) => row.tablename)).toStrictEqual(["effect_sql_migrations", "todos", "project_requests", "project"])

        })
    )

    it.effect("insertProjectRequest should persist and return a ProjectRequest", () =>
        Effect.gen(function* () {
            const repo = yield* ProjectRequestRepository

            const form: typeof ProjectRequestFormSchema.Type = {
                name: "PG Project",
                budget: 10000,
                cost: 8000,
            }

            const saved = yield* repo.insertProjectRequest(form)

            // basic shape
            expect(saved.name).toBe(form.name)
            expect(saved.budget).toBe(form.budget)
            expect(saved.cost).toBe(form.cost)

            // id is a branded ProjectId
            const id: ProjectId = saved.id
            expect(typeof id).toBe("string")

            // createdAt / updatedAt are Dates
            expect(saved.createdAt instanceof Date).toBe(true)
            expect(saved.updatedAt instanceof Date).toBe(true)
        })
    )

    it.effect("findProjectRequestById should return Option.some for existing id", () =>
        Effect.gen(function* () {
            const repo = yield* ProjectRequestRepository

            const form: typeof ProjectRequestFormSchema.Type = {
                name: "Lookup Project",
                budget: 42_000,
                cost: 40_000,
            }

            const saved = yield* repo.insertProjectRequest(form)

            const foundOpt = yield* repo.findProjectRequestById({ id: saved.id })
            expect(Option.isSome(foundOpt)).toBe(true)

            if (Option.isSome(foundOpt)) {
                const found = foundOpt.value
                expect(found.id).toBe(saved.id)
                expect(found.name).toBe(saved.name)
            }
        })
    )

    it.effect("findProjectRequestById should return Option.none for unknown id", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRequestRepository

      const unknownId = ProjectId.make(
        "00000000-0000-0000-0000-000000000000",
      )
      const foundOpt = yield* repo.findProjectRequestById({ id: unknownId })

      expect(Option.isNone(foundOpt)).toBe(true)
    })
  )

  it.effect("findAllProjectRequests should return all inserted rows", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRequestRepository

      const form1: typeof ProjectRequestFormSchema.Type = {
        name: "P1",
        budget: 1_000,
        cost: 500,
      }
      const form2: typeof ProjectRequestFormSchema.Type = {
        name: "P2",
        budget: 2_000,
        cost: 1_500,
      }

      const saved1 = yield* repo.insertProjectRequest(form1)
      const saved2 = yield* repo.insertProjectRequest(form2)

      const all = yield* repo.findAllProjectRequests()
      const ids = all.map((p) => p.id)

      expect(ids).toContain(saved1.id)
      expect(ids).toContain(saved2.id)
    })
  )

  it.effect("insertProject should persist and return a Project", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRequestRepository

      const form: typeof ProjectForm.Type = {
        id: ProjectId.make("11111111-1111-1111-1111-111111111111"),
      }

      const project = yield* repo.insertProject(form)

      expect(project.id).toBe(form.id)
      expect(project.createdAt instanceof Date).toBe(true)
      expect(project.updatedAt instanceof Date).toBe(true)
    })
  )

  it.effect("repo insertProjectRequest should create a row visible via raw SQL", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRequestRepository
      const sql = yield* SqlClient.SqlClient

      const form: typeof ProjectRequestFormSchema.Type = {
        name: "Raw Check",
        budget: 500,
        cost: 100,
      }

      const saved = yield* repo.insertProjectRequest(form)

      const rows = yield* sql<
        { id: string; name: string }
      >`SELECT id, name FROM project_requests WHERE id = ${saved.id}`

      expect(rows.length).toBe(1)
      expect(rows[0].id).toBe(saved.id)
      expect(rows[0].name).toBe(saved.name)
    })
  )

  it.effect("schema decoding should match DB row shape for ProjectRequest", () =>
    Effect.gen(function* () {
      const repo = yield* ProjectRequestRepository
      const sql = yield* SqlClient.SqlClient

      const form: typeof ProjectRequestFormSchema.Type = {
        name: "Schema Check",
        budget: 123,
        cost: 45,
      }

      const saved = yield* repo.insertProjectRequest(form)

      // raw DB row
      const rawRows = yield* sql<
        {
          id: string
          name: string
          budget: number
          cost: number
          created_at: string
          updated_at: string
        }[]
      >`SELECT * FROM project_requests WHERE id = ${saved.id}`

      expect(rawRows.length).toBe(1)

      // decode with ProjectRequest schema (snake_to_camel mapping in pgConfig)
      const decode = SqlSchema.single({
        Request: Schema.Void,
        Result: ProjectRequest,
        execute: () =>
          sql`SELECT * FROM project_requests WHERE id = ${saved.id}`,
      })

      const decoded = yield* decode()

      expect(decoded.id).toBe(saved.id)
      expect(decoded.name).toBe(form.name)
      expect(decoded.budget).toBe(form.budget)
      expect(decoded.cost).toBe(form.cost)
      expect(decoded.createdAt instanceof Date).toBe(true)
      expect(decoded.updatedAt instanceof Date).toBe(true)
    })
  )
})
