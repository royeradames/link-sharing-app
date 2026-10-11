// Removes the hosted suite's synthetic accounts from Devlinks' Preview schema:
// their saved profiles and their local principals (sessions and identities
// cascade). Only reserved .test sink addresses with the devlinks-suite- prefix
// are touched, and only those of one run (devlinks-suite-<label>-<run>@…), so
// two runs at once can't delete each other's accounts. Never logs connection
// details. The hosted suite calls this in its teardown with its own run id;
// scripts/cleanup-hosted-accounts.mjs runs it by hand.
import pg from "pg"

const sink = "@sink.accounts-preview.test"
/** Every devlinks-suite- account of every run; only for the manual script after interrupted runs. */
export const everyRun = "*"

/** The LIKE pattern for one run's accounts. The run id is lowercase letters and digits, so it can't widen the match. */
export function runPattern(run) {
  if (run === everyRun) return "devlinks-suite-%" + sink
  if (typeof run !== "string" || !/^[a-z0-9]+$/.test(run))
    throw new Error("A run id is lowercase letters and digits only; nothing was removed")
  return "devlinks-suite-%-" + run + sink
}

/** @returns {Promise<{ accounts: number, profiles: number, remaining: number }>} */
export async function removeHostedAccounts(connectionString, run) {
  const pattern = runPattern(run)
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
