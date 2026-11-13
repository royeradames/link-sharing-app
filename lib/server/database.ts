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

export class DatabaseSettingsError extends Error {}

/**
 * The app's pool on the direct (unpooled) connection. The schema is a
 * connection startup parameter, so every session resolves names only inside
 * the Devlinks schema from its first query, and a connection that cannot set
 * it fails instead of falling back to the shared database's public tables.
 * A pooler URL is refused: transaction pooling does not keep session settings.
 */
export function getDatabase(connectionString: string): pg.Pool {
  if (globalThis.__devlinksDatabase) return globalThis.__devlinksDatabase
  if (new URL(connectionString).hostname.includes("-pooler"))
    throw new DatabaseSettingsError(
      "Use the direct (unpooled) database connection."
    )
  const pool = new pg.Pool({
    connectionString,
    options: `-c search_path=${databaseSchema()}`,
    // Tests use a single-session PostgreSQL; deployments keep a small pool.
    max: Number(process.env.DATABASE_POOL_MAX) || 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  })
  pool.on("error", () =>
    console.error(JSON.stringify({ event: "database_connection_failed" }))
  )
  if (process.env.VERCEL === "1") attachDatabasePool(pool)
  globalThis.__devlinksDatabase = pool
  return pool
}
