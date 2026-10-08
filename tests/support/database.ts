import { PGlite } from "@electric-sql/pglite"
import { PGLiteSocketServer } from "@electric-sql/pglite-socket"
import pg from "pg"

/**
 * A disposable in-memory PostgreSQL reached through the real `pg` driver, so
 * the app's queries run as they do against Neon. Migrations are applied to
 * the Preview schema, exactly as `npm run db:migrate` does. PGlite is a single
 * session, so the app's pool is limited to one connection.
 */
export async function startTestDatabase({ migrate = true } = {}) {
  const database = await PGlite.create()
  const server = new PGLiteSocketServer({
    db: database,
    host: "127.0.0.1",
    port: 0,
    maxConnections: 4,
  })
  await server.start()
  const url = `postgresql://postgres@${server.getServerConn()}/postgres?sslmode=disable`
  if (migrate) {
    const migrations = await import("../../scripts/migrations.mjs")
    const client = new pg.Client({ connectionString: url })
    await client.connect()
    try {
      await migrations.applyMigrations(
        client,
        await migrations.readMigrations(),
        migrations.SCHEMAS.preview
      )
    } finally {
      await client.end()
    }
  }
  return {
    url,
    /** A direct query outside the app, for assertions. */
    async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
      text: string,
      values: unknown[] = []
    ) {
      const client = new pg.Client({ connectionString: url })
      await client.connect()
      try {
        return await client.query<T>(text, values)
      } finally {
        await client.end()
      }
    },
    async close() {
      const pool = (globalThis as { __devlinksDatabase?: pg.Pool })
        .__devlinksDatabase
      delete (globalThis as { __devlinksDatabase?: pg.Pool }).__devlinksDatabase
      await pool?.end().catch(() => undefined)
      await server.stop()
      await database.close()
    },
  }
}
