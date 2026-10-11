// Removes the hosted suite's synthetic accounts from Devlinks' Preview schema:
// their saved profiles and their local principals (sessions and identities
// cascade). Only reserved .test sink addresses with the devlinks-suite- prefix
// are touched. Never logs connection details. The hosted suite calls this in
// its teardown; scripts/cleanup-hosted-accounts.mjs runs it by hand.
import pg from "pg"

const pattern = "devlinks-suite-%@sink.accounts-preview.test"

/** @returns {Promise<{ accounts: number, profiles: number, remaining: number }>} */
export async function removeHostedAccounts(connectionString) {
  if (!connectionString) throw new Error("POSTGRES_URL_NON_POOLING is missing; synthetic accounts were not removed")
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
    return { accounts: users.rowCount ?? 0, profiles: profiles.rowCount ?? 0, remaining: left.rows[0].count }
  } catch {
    await client.query("ROLLBACK").catch(() => {})
    throw new Error("Devlinks cleanup failed; no connection details are logged")
  } finally {
    await client.end().catch(() => {})
  }
}
