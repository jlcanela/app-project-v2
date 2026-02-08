import { SqlClient } from "@effect/sql"
import { Effect } from "effect"

// eslint-disable-next-line no-restricted-syntax
export default Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient

    // Main table for projects
    yield* sql`
    CREATE TABLE project (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `

    // Keep updated_at in sync
    yield* sql`
    CREATE OR REPLACE FUNCTION set_project_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at := CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `

    /* v8 ignore start -- @preserve */
    yield* sql`
    CREATE TRIGGER project_updated_at_trg
    BEFORE UPDATE ON project
    FOR EACH ROW
    EXECUTE FUNCTION set_project_updated_at();
  `

    /* v8 ignore start -- @preserve */
    yield* sql`
    CREATE INDEX project_created_at_idx
      ON project (created_at DESC);
  `

})
