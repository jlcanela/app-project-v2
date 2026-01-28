import { SqlClient } from "@effect/sql"
import { Effect } from "effect"

// eslint-disable-next-line no-restricted-syntax
export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient

  // Ensure useful extensions are present
  yield* sql`
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `

  // Main table for project requests
  yield* sql`
    CREATE TABLE project_requests (
      id UUID PRIMARY KEY DEFAULT uuidv7(),

      -- Domain data (align with ProjectRequestForm / ProjectSummary)
      name   TEXT            NOT NULL,
      budget NUMERIC(12, 2)  NOT NULL,
      cost   NUMERIC(12, 2)  NOT NULL,

      -- Validation / status
      status TEXT            NOT NULL DEFAULT 'PENDING',
      issues JSONB           NOT NULL DEFAULT '[]'::jsonb,

      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Keep updated_at in sync
  yield* sql`
    CREATE OR REPLACE FUNCTION set_project_requests_updated_at()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at := CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `

  yield* sql`
    CREATE TRIGGER project_requests_updated_at_trg
    BEFORE UPDATE ON project_requests
    FOR EACH ROW
    EXECUTE FUNCTION set_project_requests_updated_at();
  `

  // Helpful indexes
  yield* sql`
    CREATE INDEX project_requests_status_idx
      ON project_requests (status);

    CREATE INDEX project_requests_created_at_idx
      ON project_requests (created_at DESC);
  `
})
