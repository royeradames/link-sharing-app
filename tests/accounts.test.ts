// Hosted accounts against the real @royer/auth central adapter: a local
// issuer on loopback HTTP, the app's own route handlers called in-process, and
// an in-memory PostgreSQL migrated exactly like the Preview schema. The app's
// address is an HTTPS *.localhost name because the issuer, like production,
// only accepts HTTPS callbacks on non-loopback hosts; nothing listens on it.
import test, { after, before } from "node:test"
import assert from "node:assert/strict"
import { randomBytes } from "node:crypto"
import { startTestDatabase } from "./support/database.ts"
import { cookieJar, freePort, startLocalIssuer } from "./support/local-issuer.mjs"

type Jar = ReturnType<typeof cookieJar>
type Handler = (request: Request) => Promise<Response>
const people = {
  alice: { name: "Alice Example", email: "alice@example.test", password: randomBytes(18).toString("base64url") },
  bob: { name: "Bob Example", email: "bob@example.test", password: randomBytes(18).toString("base64url") },
  carol: { name: "Carol Example", email: "carol@example.test", password: randomBytes(18).toString("base64url") },
}
const draft = (first: string, email: string, url: string) => ({
  profile: { firstName: first, lastName: "Example", email, image: "" },
  links: [{ id: crypto.randomUUID(), platform: "github", url }],
})

let APP = ""
let issuer: Awaited<ReturnType<typeof startLocalIssuer>>
let database: Awaited<ReturnType<typeof startTestDatabase>>
let auth: { GET: Handler; POST: Handler }
let account: { GET: Handler }
let profile: { PUT: Handler }
let publishing: { PUT: Handler }
let publicProfile: (id: string) => Promise<unknown>
let decoysBefore = ""
const decoys = async () =>
  JSON.stringify(
    await Promise.all(
      ["user", "session", "devlinks_profiles"].map(
        async table => (await database.query(`select * from public."${table}" order by 1`)).rows
      )
    )
  )

before(async () => {
  APP = `https://devlinks.localhost:${await freePort()}`
  issuer = await startLocalIssuer({
    clients: [{ name: "Devlinks (local test)", callbackURL: `${APP}/api/auth/federation/callback`, logoutURL: `${APP}/account` }],
  })
  for (const person of Object.values(people)) await issuer.createAccount(person)
  database = await startTestDatabase()
  // Decoys with Devlinks' table names in the shared database's public schema:
  // the app must never read or write them.
  await database.query(`
    create table public."user" ("id" text primary key, "name" text, "email" text);
    create table public."session" ("id" text primary key, "token" text);
    create table public."devlinks_profiles" ("issuer" text, "subject" text, "public_id" text, "note" text);
    insert into public."user" values ('decoy-user', 'Decoy', 'decoy@example.test');
    insert into public."session" values ('decoy-session', 'decoy-token');
    insert into public."devlinks_profiles" values ('decoy', 'decoy', 'decoydecoy12', 'untouched');
  `)
  decoysBefore = await decoys()
  const [client] = issuer.credentials
  Object.assign(process.env, {
    POSTGRES_URL_NON_POOLING: database.url,
    DATABASE_POOL_MAX: "1",
    AUTH_BASE_URL: APP,
    AUTH_SECRET: randomBytes(32).toString("base64url"),
    AUTH_ISSUER_URL: issuer.issuerURL,
    AUTH_CLIENT_ID: client.clientId,
    AUTH_CLIENT_SECRET: client.clientSecret,
  })
  auth = await import("../app/api/auth/[...all]/route.ts")
  account = await import("../app/api/account/route.ts")
  profile = await import("../app/api/account/profile/route.ts")
  publishing = await import("../app/api/account/publishing/route.ts")
  publicProfile = (await import("../lib/server/profile-store.ts")).publicProfileFor
})
after(async () => {
  await database?.close()
  await issuer?.close()
})

/** Signs in on the issuer, then completes the app's central sign-in. */
async function signIn(person: (typeof people)["alice"]): Promise<Jar> {
  const issuerJar = cookieJar()
  const app = cookieJar()
  const session = await fetch(`${issuer.origin}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { origin: issuer.origin, "content-type": "application/json" },
    body: JSON.stringify({ email: person.email, password: person.password }),
  })
  assert.equal(session.status, 200, "issuer sign-in")
  issuerJar.store(session)
  const start = await auth.POST(
    new Request(`${APP}/api/auth/federation/start`, {
      method: "POST",
      headers: { origin: APP, "content-type": "application/json" },
      body: JSON.stringify({ returnPath: "/dashboard/links" }),
    })
  )
  assert.equal(start.status, 200, "federation start")
  app.store(start)
  let next = ((await start.json()) as { url: string }).url
  for (let hop = 0; hop < 6 && !next.startsWith(APP); hop++) {
    const step = await fetch(next, { redirect: "manual", headers: { cookie: issuerJar.header() } })
    issuerJar.store(step)
    // A browser navigation gets a 302; this non-navigation request gets the
    // same continuation as JSON.
    const location =
      step.headers.get("location") ??
      (step.ok ? ((await step.json()) as { url?: string }).url : undefined)
    assert.ok(location, `issuer step ${hop} continues (${step.status})`)
    next = new URL(location, next).href
  }
  const callback = await auth.GET(new Request(next, { headers: { cookie: app.header() } }))
  assert.equal(callback.status, 302, "callback signs in")
  assert.equal(new URL(callback.headers.get("location") ?? "", APP).pathname, "/dashboard/links")
  app.store(callback)
  return app
}

const read = (jar?: Jar) =>
  account.GET(new Request(`${APP}/api/account`, { headers: jar ? { cookie: jar.header() } : {} }))
const write = (handler: { PUT: Handler }, path: string, jar: Jar | undefined, body: unknown, origin = APP) =>
  handler.PUT(
    new Request(`${APP}${path}`, {
      method: "PUT",
      headers: { origin, "content-type": "application/json", ...(jar ? { cookie: jar.header() } : {}) },
      body: JSON.stringify(body),
    })
  )
type AccountBody = {
  state: string
  user?: { name: string; email: string }
  profile?: {
    document: { revision: string; draft: ReturnType<typeof draft> } | null
    publicId: string | null
    publishingRevision: string | null
  }
}
/** Saves publishing choices against the revision this account last loaded. */
async function publish(jar: Jar, choices: Record<string, boolean>, expectedRevision?: string | null) {
  const current = (await (await read(jar)).json()) as AccountBody
  return write(publishing, "/api/account/publishing", jar, {
    expectedRevision: expectedRevision === undefined ? current.profile?.publishingRevision ?? null : expectedRevision,
    publishing: choices,
  })
}

test("two accounts never see or overwrite each other's profile and links", async () => {
  const alice = await signIn(people.alice)
  const bob = await signIn(people.bob)

  const aliceStart = (await (await read(alice)).json()) as AccountBody
  assert.equal(aliceStart.state, "signed_in")
  assert.equal(aliceStart.user?.email, people.alice.email)
  assert.equal(aliceStart.profile?.document, null, "a new account starts empty")

  const saved = await write(profile, "/api/account/profile", alice, {
    expectedRevision: null,
    draft: draft("Alice", people.alice.email, "https://github.com/alice"),
  })
  assert.equal(saved.status, 200)
  const aliceRevision = ((await saved.json()) as AccountBody).profile?.document?.revision
  assert.ok(aliceRevision)

  const bobView = (await (await read(bob)).json()) as AccountBody
  assert.equal(bobView.user?.email, people.bob.email)
  assert.equal(bobView.profile?.document, null, "Bob does not see Alice's saved profile")

  // Bob replaying Alice's revision cannot write over her row.
  const replay = await write(profile, "/api/account/profile", bob, {
    expectedRevision: aliceRevision,
    draft: draft("Mallory", people.bob.email, "https://github.com/mallory"),
  })
  assert.equal(replay.status, 409)
  const bobSave = await write(profile, "/api/account/profile", bob, {
    expectedRevision: null,
    draft: draft("Bob", people.bob.email, "https://github.com/bob"),
  })
  assert.equal(bobSave.status, 200)

  const aliceAfter = (await (await read(alice)).json()) as AccountBody
  assert.equal(aliceAfter.profile?.document?.revision, aliceRevision)
  assert.equal(aliceAfter.profile?.document?.draft.links[0].url, "https://github.com/alice")
  const bobAfter = (await (await read(bob)).json()) as AccountBody
  assert.equal(bobAfter.profile?.document?.draft.links[0].url, "https://github.com/bob")
  assert.notEqual(aliceAfter.profile?.publicId, bobAfter.profile?.publicId)

  // A stale revision from the same account is a conflict, not a silent overwrite.
  const stale = await write(profile, "/api/account/profile", alice, {
    expectedRevision: crypto.randomUUID(),
    draft: draft("Alice", people.alice.email, "https://github.com/stale"),
  })
  assert.equal(stale.status, 409)

  const rows = await database.query<{ subject: string }>(
    'select "subject" from "devlinks_preview"."devlinks_profiles" order by "subject"'
  )
  assert.equal(rows.rowCount, 2, "one row per issuer subject")
})

test("signed-out, forged and cross-site requests cannot read or write account data", async () => {
  assert.equal((await read()).status, 401)
  const forged = cookieJar()
  forged.store(new Response(null, { headers: { "set-cookie": "royer-devlinks.session_token=forged.value" } }))
  assert.equal((await read(forged)).status, 401)
  assert.equal(
    (await write(profile, "/api/account/profile", undefined, { expectedRevision: null, draft: draft("X", "", "https://github.com/x") })).status,
    401
  )
  const alice = await signIn(people.alice)
  const crossSite = await write(
    profile,
    "/api/account/profile",
    alice,
    { expectedRevision: null, draft: draft("X", "", "https://github.com/x") },
    "https://evil.example"
  )
  assert.equal(crossSite.status, 403)
  const invalid = await write(profile, "/api/account/profile", alice, {
    expectedRevision: null,
    draft: draft("Alice", "", "javascript:alert(1)"),
  })
  assert.equal(invalid.status, 400)
})

test("a public profile shows only the published fields of the saved profile", async () => {
  const alice = await signIn(people.alice)
  const current = (await (await read(alice)).json()) as AccountBody
  const publicId = current.profile?.publicId
  assert.ok(publicId)
  assert.equal(await publicProfile(publicId), null, "unpublished profiles are not public")

  const published = await publish(alice, {
    published: true,
    name: true,
    email: false,
    image: true,
    links: true,
  })
  assert.equal(published.status, 200)
  const view = await publicProfile(publicId)
  assert.deepEqual(view, {
    name: "Alice Example",
    links: [{ platform: "github", url: "https://github.com/alice" }],
  })
  assert.ok(!JSON.stringify(view).includes(people.alice.email), "hidden email is never served")

  // Each field follows its own choice; turning links off leaves an empty list.
  await publish(alice, { published: true, name: false, email: true, image: false, links: false })
  assert.deepEqual(await publicProfile(publicId), { email: people.alice.email, links: [] })

  await publish(alice, { published: false, name: true, email: true, image: true, links: true })
  assert.equal(await publicProfile(publicId), null, "unpublishing takes the page down")
  assert.equal(await publicProfile("not-a-valid-id"), null)

  const bob = await signIn(people.bob)
  const bobId = ((await (await read(bob)).json()) as AccountBody).profile?.publicId
  assert.ok(bobId)
  assert.equal(await publicProfile(bobId), null, "Bob has not published")
})

test("a stale publishing change conflicts instead of overwriting newer choices", async () => {
  const alice = await signIn(people.alice)
  const loaded = ((await (await read(alice)).json()) as AccountBody).profile?.publishingRevision
  assert.ok(loaded)
  const first = await publish(alice, { published: true, name: true, email: false, image: true, links: true }, loaded)
  assert.equal(first.status, 200)
  // A second tab still holding the old revision tries to publish the email.
  const stale = await publish(alice, { published: true, name: true, email: true, image: true, links: true }, loaded)
  assert.equal(stale.status, 409)
  const publicId = ((await (await read(alice)).json()) as AccountBody).profile?.publicId ?? ""
  assert.deepEqual(Object.keys((await publicProfile(publicId)) ?? {}).includes("email"), false)
  // Publishing before anything is saved is refused, not created empty.
  const fresh = await signIn(people.carol)
  assert.equal((await publish(fresh, { published: true, name: true, email: false, image: true, links: true })).status, 409)
})

test("the shared database's public tables are never read or written", async () => {
  assert.equal(await decoys(), decoysBefore)
  assert.equal(await publicProfile("decoydecoy12"), null, "a public-schema row is not a profile")
})
