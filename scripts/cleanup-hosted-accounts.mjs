// Removes the hosted suite's synthetic accounts from Devlinks' Preview schema:
// their saved profiles and their local principals (sessions and identities
// cascade). Only reserved .test sink addresses with the devlinks-suite- prefix
// are touched; the suite removes the issuer side itself. Prints counts, never
// connection details.
//
//   POSTGRES_URL_NON_POOLING=… node scripts/cleanup-hosted-accounts.mjs
import pg from "pg"

const pattern = "devlinks-suite-%@sink.accounts-preview.test"
const connectionString = process.env.POSTGRES_URL_NON_POOLING
if (!connectionString) {
  console.error("POSTGRES_URL_NON_POOLING is missing; synthetic accounts were not removed")
  process.exit(1)
}
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 10000 })
try {
  await client.connect()
  await client.query("BEGIN")
  await client.query('SET LOCAL search_path TO "devlinks_preview"')
  const profiles = await client.query(
    `DELETE FROM "devlinks_profiles" p USING "federationIdentity" i, "user" u
      WHERE p."issuer" = i."issuer" AND p."subject" = i."subject" AND i."userId" = u."id" AND u."email" LIKE $1`,
    [pattern]
  )
  const users = await client.query('DELETE FROM "user" WHERE "email" LIKE $1', [pattern])
  const left = await client.query('SELECT count(*)::int AS count FROM "user" WHERE "email" LIKE $1', [pattern])
  await client.query("COMMIT")
  console.log(`devlinks_preview: removed ${users.rowCount} accounts and ${profiles.rowCount} profiles, remaining ${left.rows[0].count}`)
  process.exitCode = left.rows[0].count === 0 ? 0 : 1
} catch {
  await client.query("ROLLBACK").catch(() => {})
  console.error("cleanup failed; no connection details are logged")
  process.exitCode = 1
} finally {
  await client.end()
}
