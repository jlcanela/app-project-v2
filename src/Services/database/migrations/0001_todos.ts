import { SqlClient  } from "@effect/sql";
import { Effect } from "effect";

// eslint-disable-next-line no-restricted-syntax
export default Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient;

    yield* sql`
        CREATE EXTENSION IF NOT EXISTS unaccent;
        `;

    yield* sql`
        CREATE TABLE todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        title_unaccent TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP);
        `;

    yield* sql`
        CREATE OR REPLACE FUNCTION normalize_diacritic(text) RETURNS text AS $$
        DECLARE
            normalized TEXT;
            digraphs   TEXT[] := ARRAY[
                'ae', 'oe', 'ue', 'ss', -- German, French
                'æ', 'œ'                -- French ligatures (if present after unaccent, usually stripped)
            ];
            graphs     TEXT[] := ARRAY[
                'a', 'o', 'u', 's',     -- canonical forms
                'a', 'o'                -- ligatures
            ];
            i INTEGER;
        BEGIN
            normalized := lower(unaccent($1));
            FOR i IN array_lower(digraphs, 1)..array_upper(digraphs, 1) LOOP
                normalized := REPLACE(normalized, digraphs[i], graphs[i]);
            END LOOP;
            RETURN normalized;
        END;
        $$ LANGUAGE plpgsql;
        `;

    yield* sql`
        CREATE OR REPLACE FUNCTION set_title_unaccent() RETURNS trigger AS $$
        BEGIN
            NEW.title_unaccent := normalize_diacritic(NEW.title);
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        `;

    yield* sql`
        CREATE TRIGGER todos_title_unaccent_trg
        BEFORE INSERT OR UPDATE ON todos
        FOR EACH ROW EXECUTE FUNCTION set_title_unaccent();
        `;

    yield* sql`
        CREATE INDEX todos_title_fts_idx
        ON todos
        USING GIN (to_tsvector('simple', title_unaccent));
        `;
    
});
