// The hosted suite's teardown removes only its own run's synthetic accounts,
// so two runs at once can't delete each other's accounts mid-journey.
import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { randomUUID } from "node:crypto"
import { startTestDatabase } from "./support/database.ts"
import { removeHostedAccounts } from "../scripts/hosted-accounts.mjs"

let database: Awaited<ReturnType<typeof startTestDatabase>>
before(async () => {
  database = await startTestDatabase()
})
after(async () => {
  await database?.close()
})

async function seed(email: string) {
  const id = randomUUID()
  const subject = randomUUID()
  await database.query(
    `insert into "user" ("id", "name", "email", "emailVerified") values ($1, 'Synthetic', $2, true)`,
    [id, email]
  )
  await database.query(
    `insert into "federationIdentity" ("id", "issuer", "subject", "userId") values ($1, 'https://issuer.test/api/auth', $2, $3)`,
    [randomUUID(), subject, id]
  )
  await database.query(
    `insert into "devlinks_profiles" ("issuer", "subject", "public_id", "document", "revision", "publishing", "publishing_revision")
     values ('https://issuer.test/api/auth', $1, $2, '{}', $3, '{}', $4)`,
    [subject, randomUUID().replace(/-/g, "").slice(0, 12), randomUUID(), randomUUID()]
  )
}
async function emails() {
  const rows = await database.query<{ email: string }>(
    `select "email" from "user" order by "email"`
  )
  return rows.rows.map(row => row.email)
}

test("teardown removes only its own run's accounts and profiles", async () => {
  const mine = "devlinks-suite-j-runa1@sink.accounts-preview.test"
  const theirs = "devlinks-suite-j-runb2@sink.accounts-preview.test"
  const person = "someone@example.com"
  for (const email of [mine, theirs, person]) await seed(email)

  const removed = await removeHostedAccounts(database.url, "runa1")
  assert.deepEqual(removed, { accounts: 1, profiles: 1, remaining: 0 })
  assert.deepEqual(await emails(), [theirs, person])

  // A later run, or the manual script, can still remove the other run.
  assert.deepEqual(await removeHostedAccounts(database.url, "runb2"), {
    accounts: 1,
    profiles: 1,
    remaining: 0,
  })
  assert.deepEqual(await emails(), [person])
})

test("a run id that could widen the match is refused before any delete", async () => {
  await seed("devlinks-suite-j-runc3@sink.accounts-preview.test")
  for (const run of ["", "%", "run_c3", "runc3%", "RUNC3", "run c3"])
    await assert.rejects(removeHostedAccounts(database.url, run), /run id/)
  assert.ok(
    (await emails()).includes("devlinks-suite-j-runc3@sink.accounts-preview.test")
  )
})

test("the manual --all sweep removes every run's accounts and nobody else's", async () => {
  const { everyRun } = await import("../scripts/hosted-accounts.mjs")
  const person = "another.person@example.com"
  for (const email of [
    "devlinks-suite-v-rund4@sink.accounts-preview.test",
    "devlinks-suite-j-rune5@sink.accounts-preview.test",
    person,
  ])
    await seed(email)
  // "*" is not the sweep: only the exported symbol is.
  await assert.rejects(removeHostedAccounts(database.url, "*"), /run id/)
  const before = (await emails()).filter(email => email.startsWith("devlinks-suite-")).length
  const removed = await removeHostedAccounts(database.url, everyRun)
  assert.equal(removed.accounts, before)
  assert.equal(removed.remaining, 0)
  const left = await emails()
  assert.ok(left.includes(person))
  assert.equal(left.filter(email => email.startsWith("devlinks-suite-")).length, 0)
})
