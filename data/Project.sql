CREATE TABLE project (
  -- Business Entity (hub-like)
  id              text PRIMARY KEY,
  tag             text NOT NULL DEFAULT 'Project', -- _tag from schema
  owner_id        text NOT NULL,                   -- PartyId (FK when parties table exists)
  model_version   integer NOT NULL DEFAULT 3,      -- overall project model version

  -- Satellite JSONB columns
  core            jsonb NOT NULL,   -- ProjectCoreSatellite
  planning        jsonb NOT NULL,   -- ProjectPlanningSatellite
  execution       jsonb NOT NULL,   -- ProjectExecutionSatellite
  governance      jsonb NOT NULL,   -- ProjectGovernanceSatellite
  auxiliary       jsonb NOT NULL,   -- ProjectAuxiliarySatellite

  -- Optional per-satellite schema versions (for Transformers)
  core_version       integer NOT NULL DEFAULT 1,
  planning_version   integer NOT NULL DEFAULT 1,
  execution_version  integer NOT NULL DEFAULT 1,
  governance_version integer NOT NULL DEFAULT 1,
  auxiliary_version  integer NOT NULL DEFAULT 1,

  -- Audit columns
  created_at      timestamptz NOT NULL DEFAULT now(),
  created_by      text        NOT NULL,
  updated_at      timestamptz NOT NULL DEFAULT now(),
  updated_by      text        NOT NULL,
  deleted_at      timestamptz,
  deleted_by      text
);
