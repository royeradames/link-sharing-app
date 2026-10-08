import { attachDatabasePool } from "@vercel/functions"
import pg from "pg"

declare global {
  var __devlinksDatabase: pg.Pool | undefined
}

/**
 * Devlinks keeps its tables in its own schema of the project's existing
 * Postgres: Production uses "devlinks" and every other deployment uses
 * "devlinks_preview", so a Preview can never write Production data. The
 * names match SCHEMAS in scripts/migrations.mjs.
 */
export function databaseSchema(env = process.env) {
  return env.VERCEL_ENV === "production" ? "devlinks" : "devlinks_preview"
}

/**
 * The app's pool on the direct (unpooled) connection, so a session-level
 * search_path is safe. Every new connection resolves names only inside the
 * Devlinks schema; the shared database's public tables are never visible.
 */
export function getDatabase(connectionString: string): pg.Pool {
  if (globalThis.__devlinksDatabase) return globalThis.__devlinksDatabase
  const schema = databaseSchema()
  const pool = new pg.Pool({
    connectionString,
    // Tests use a single-session PostgreSQL; deployments keep a small pool.
    max: Number(process.env.DATABASE_POOL_MAX) || 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })
  // Queued before any other query on this connection.
  pool.on("connect", client => {
    client.query(`set search_path to "${schema}"`).catch(() => {
      console.error(JSON.stringify({ event: "database_schema_failed" }))
    })
  })
  pool.on("error", () =>
    console.error(JSON.stringify({ event: "database_connection_failed" }))
  )
  if (process.env.VERCEL === "1") attachDatabasePool(pool)
  globalThis.__devlinksDatabase = pool
  return pool
}
