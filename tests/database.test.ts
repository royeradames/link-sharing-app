// The schema lock: every app connection starts inside the Devlinks schema
// for its environment, and pooler URLs (which drop session settings) are
// refused. A live check against Neon is recorded in the PR notes.
import test from "node:test"
import assert from "node:assert/strict"
import { databaseSchema, DatabaseSettingsError, getDatabase } from "../lib/server/database.ts"
import { SCHEMAS } from "../scripts/migrations.mjs"

test("Preview and Production map to separate Devlinks schemas", () => {
  assert.equal(databaseSchema({ VERCEL_ENV: "production" } as unknown as NodeJS.ProcessEnv), SCHEMAS.production)
  assert.equal(databaseSchema({ VERCEL_ENV: "preview" } as unknown as NodeJS.ProcessEnv), SCHEMAS.preview)
  assert.equal(databaseSchema({} as unknown as NodeJS.ProcessEnv), SCHEMAS.preview)
})

test("connections set the schema at startup and pooler URLs are refused", async () => {
  delete process.env.VERCEL_ENV
  assert.throws(
    () => getDatabase("postgresql://u@ep-example-pooler.us-east-1.aws.neon.tech/db"),
    DatabaseSettingsError
  )
  const pool = getDatabase("postgresql://u@127.0.0.1:1/db")
  assert.equal((pool as unknown as { options: { options: string } }).options.options, "-c search_path=devlinks_preview")
  await pool.end()
})
