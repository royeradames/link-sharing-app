// Without central account settings (today's Production), the app is the
// browser-local editor: account routes say "coming soon" and never touch the
// database, even when one is configured.
import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { startTestDatabase } from "./support/database.ts"

let database: Awaited<ReturnType<typeof startTestDatabase>>
before(async () => {
  database = await startTestDatabase()
  for (const name of ["AUTH_BASE_URL", "AUTH_SECRET", "AUTH_ISSUER_URL", "AUTH_CLIENT_ID", "AUTH_CLIENT_SECRET"])
    delete process.env[name]
  process.env.POSTGRES_URL_NON_POOLING = database.url
  process.env.DATABASE_POOL_MAX = "1"
})
after(async () => {
  await database?.close()
})

test("guest mode: account routes report coming soon and write nothing", async () => {
  const { accountsConfig } = await import("../lib/server/accounts.ts")
  assert.deepEqual(accountsConfig(), { enabled: false, origin: null })
  const account = await import("../app/api/account/route.ts")
  const profile = await import("../app/api/account/profile/route.ts")
  const publishing = await import("../app/api/account/publishing/route.ts")
  const auth = await import("../app/api/auth/[...all]/route.ts")
  const { publicProfileFor } = await import("../lib/server/profile-store.ts")

  const read = await account.GET(new Request("http://127.0.0.1:1/api/account"))
  assert.equal(read.status, 404)
  assert.deepEqual(await read.json(), { state: "coming_soon" })
  const body = JSON.stringify({ expectedRevision: null, draft: { profile: {}, links: [] } })
  const init = { method: "PUT", headers: { origin: "http://127.0.0.1:1", "content-type": "application/json" }, body }
  assert.equal((await profile.PUT(new Request("http://127.0.0.1:1/api/account/profile", init))).status, 404)
  assert.equal((await publishing.PUT(new Request("http://127.0.0.1:1/api/account/publishing", init))).status, 404)
  const start = await auth.POST(
    new Request("http://127.0.0.1:1/api/auth/federation/start", { method: "POST", headers: { origin: "http://127.0.0.1:1" }, body: "{}" })
  )
  assert.equal(start.status, 404)
  assert.equal(await publicProfileFor("abcdefghjkmn"), null)
  assert.equal(
    (globalThis as { __devlinksDatabase?: unknown }).__devlinksDatabase,
    undefined,
    "no database pool is opened in guest mode"
  )
  const rows = await database.query('select count(*)::int as n from "devlinks_preview"."devlinks_profiles"')
  assert.equal(rows.rows[0].n, 0)
})
