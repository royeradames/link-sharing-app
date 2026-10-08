// Real-browser journey for hosted accounts, entirely on this machine: the
// reviewed @royer/auth issuer on loopback HTTP, the Devlinks app built with
// central sign-in switched on behind an HTTPS front door on a *.localhost
// name, an in-memory PostgreSQL and synthetic people.
//
//   npm run test:journey
//
// It builds into .next-journey (the guest build in .next is untouched).
// Ports: DEVLINKS_JOURNEY_PORT (default 4471) for the app and the next one
// for its HTTPS front door; the issuer takes a free port. Screenshots and
// results go to .test-state/accounts-journey/.
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { randomBytes } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { request as httpRequest } from "node:http"
import { createServer } from "node:https"
import { chromium } from "@playwright/test"
import { startTestDatabase } from "./support/database.ts"
import { startLocalIssuer } from "./support/local-issuer.mjs"
import { localCertificates } from "./support/tls.mjs"

const port = Number(process.env.DEVLINKS_JOURNEY_PORT || 4471)
const APP = `https://devlinks.localhost:${port + 1}`
const distDir = ".next-journey"
/** Spawns a command and resolves with its exit code. */
const exec = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: { ...process.env, ...env }, stdio: "inherit" })
    child.on("error", reject)
    child.on("exit", resolve)
  })
const out = ".test-state/accounts-journey"
const storageKey = "devlinks.saved-draft.v1"
const people = {
  alice: { name: "Alice Example", email: "alice@example.test", password: randomBytes(18).toString("base64url") },
  bob: { name: "Bob Example", email: "bob@example.test", password: randomBytes(18).toString("base64url") },
}
await mkdir(out, { recursive: true })
const results = []
const errors = []
const cleanup = []
const pages = []
const log = step => {
  results.push(step)
  console.log("✓", step)
}

try {
  // The editor's pages are static: whether accounts exist and their address
  // are fixed at build time, as on Vercel. Runtime secrets are not needed.
  if (!process.env.SKIP_BUILD) {
    const built = await exec("node_modules/.bin/next", ["build"], {
      DEVLINKS_DIST_DIR: distDir,
      AUTH_BASE_URL: APP,
      AUTH_SECRET: "journey-build-placeholder-0123456789abcdef",
      AUTH_ISSUER_URL: "http://localhost:1/api/auth",
      AUTH_CLIENT_ID: "journey-build-placeholder",
      AUTH_CLIENT_SECRET: "journey-build-placeholder",
      POSTGRES_URL_NON_POOLING: "postgresql://placeholder@127.0.0.1:1/placeholder",
    })
    assert.equal(built, 0, "journey build")
  }
  const issuer = await startLocalIssuer({
    clients: [{ name: "Devlinks (local test)", callbackURL: `${APP}/api/auth/federation/callback`, logoutURL: `${APP}/account` }],
  })
  cleanup.push(() => issuer.close())
  for (const person of Object.values(people)) await issuer.createAccount(person)
  const database = await startTestDatabase()
  cleanup.push(() => database.close())
  const [client] = issuer.credentials
  const app = spawn("node_modules/.bin/next", ["start", "-H", "127.0.0.1", "-p", String(port)], {
    env: {
      ...process.env,
      DEVLINKS_DIST_DIR: distDir,
      POSTGRES_URL_NON_POOLING: database.url,
      DATABASE_POOL_MAX: "1",
      AUTH_BASE_URL: APP,
      AUTH_SECRET: randomBytes(32).toString("base64url"),
      AUTH_ISSUER_URL: issuer.issuerURL,
      AUTH_CLIENT_ID: client.clientId,
      AUTH_CLIENT_SECRET: client.clientSecret,
    },
    stdio: ["ignore", "pipe", "pipe"],
  })
  let appLog = ""
  app.stdout.on("data", chunk => (appLog += chunk))
  app.stderr.on("data", chunk => (appLog += chunk))
  cleanup.push(async () => {
    app.kill("SIGTERM")
    await writeFile(`${out}/app.log`, appLog)
  })
  // HTTPS front door for the app, like Vercel's edge: same host, forwarded proto.
  const tls = await localCertificates(["devlinks.localhost"])
  const proxy = createServer(tls, (incoming, outgoing) => {
    const upstream = httpRequest(
      {
        host: "127.0.0.1",
        port,
        method: incoming.method,
        path: incoming.url,
        headers: { ...incoming.headers, "x-forwarded-proto": "https", "x-forwarded-host": incoming.headers.host },
      },
      response => {
        outgoing.writeHead(response.statusCode ?? 502, response.headers)
        response.pipe(outgoing)
      }
    )
    upstream.on("error", () => {
      if (!outgoing.headersSent) outgoing.writeHead(502)
      outgoing.end()
    })
    incoming.pipe(upstream)
  })
  await new Promise(resolve => proxy.listen(port + 1, "::", resolve))
  cleanup.push(() => new Promise(resolve => { proxy.close(resolve); proxy.closeAllConnections() }))
  for (let attempt = 0; ; attempt++) {
    const ready = await fetch(`http://127.0.0.1:${port}/api/account`).then(r => r.status === 401).catch(() => false)
    if (ready) break
    assert.ok(attempt < 60, "The app did not start with accounts enabled")
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  log("Local issuer registered Devlinks; the built app answers with accounts enabled.")

  const browsers = [await chromium.launch({ channel: "chrome" }), await chromium.launch({ channel: "chrome" })]
  cleanup.push(...browsers.map(browser => () => browser.close()))
  async function open(browser, label) {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } })
    const page = await context.newPage()
    page.on("pageerror", error => errors.push(`${label}: ${error.message}`))
    pages.push({ label, page })
    return { context, page }
  }
  async function signIn({ context, page }, person) {
    const session = await context.request.post(`${issuer.origin}/api/auth/sign-in/email`, {
      data: { email: person.email, password: person.password },
      headers: { origin: issuer.origin },
    })
    assert.equal(session.status(), 200, "issuer sign-in")
    await page.goto(`${APP}/account`)
    let callback = null
    const seen = request => {
      if (request.url().startsWith(`${APP}/api/auth/federation/callback`)) callback ??= request.url()
    }
    page.on("request", seen)
    await page.getByRole("button", { name: "Sign in with Breakthrough", exact: true }).click()
    await page.waitForURL(`${APP}/account`)
    await page.getByText(`Signed in as ${person.name} (${person.email})`).waitFor()
    page.off("request", seen)
    return callback
  }
  async function addLink(page, platform, url) {
    await page.getByRole("button", { name: "+ Add new link", exact: true }).click()
    const row = page.locator(".link-row").last()
    await row.locator("summary").click()
    await row.getByLabel("Search platforms").fill(platform)
    await row.getByRole("button", { name: platform, exact: true }).click()
    await row.getByLabel("Link URL").fill(url)
  }
  async function status(page, text) {
    await page.getByRole("status").filter({ hasText: text }).waitFor()
  }
  async function widths(page, name) {
    for (const width of [400, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.evaluate(() => document.fonts.ready)
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name} overflows at ${width}`)
      const smallest = await page.evaluate(() =>
        Math.min(...[...document.querySelectorAll("body *")]
          .filter(el => el.checkVisibility() && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
          .map(el => parseFloat(getComputedStyle(el).fontSize)))
      )
      assert.ok(smallest >= 16, `${name} has ${smallest}px text at ${width}`)
      await page.screenshot({ path: `${out}/${name}-${width}.png`, fullPage: true })
    }
    await page.setViewportSize({ width: 1280, height: 900 })
  }

  // 1. A guest keeps the browser-local editor even with accounts switched on.
  const guest = await open(browsers[0], "guest")
  await guest.page.goto(`${APP}/dashboard/links`)
  await guest.page.getByText("Guest mode. Saves stay in this browser.").waitFor()
  await addLink(guest.page, "GitHub", "https://github.com/guest")
  await guest.page.getByRole("button", { name: "Save links", exact: true }).click()
  await status(guest.page, "Links saved in this browser.")
  assert.ok(await guest.page.evaluate(key => localStorage.getItem(key), storageKey))
  let rows = await database.query('select count(*)::int as n from "devlinks_preview"."devlinks_profiles"')
  assert.equal(rows.rows[0].n, 0, "a guest save writes nothing to the server")
  await widths(guest.page, "guest-links")
  log("A guest saves links in this browser; nothing reaches the database.")

  // 2. Alice signs in and her saves go to her account, not this browser.
  const alice = await open(browsers[0], "alice")
  await alice.page.goto(`${APP}/account`)
  await alice.page.getByRole("heading", { name: "Save your profile to your account" }).waitFor()
  await widths(alice.page, "account-signed-out")
  await signIn(alice, people.alice)
  await alice.page.getByRole("link", { name: "Links", exact: true }).click()
  await alice.page.getByText("Signed in as Alice Example. Saves go to your account.").waitFor()
  await alice.page.getByRole("heading", { name: "Let’s get you started" }).waitFor()
  await addLink(alice.page, "GitHub", "https://github.com/alice")
  await addLink(alice.page, "YouTube", "https://youtube.com/@alice")
  await alice.page.getByRole("button", { name: "Save links", exact: true }).click()
  await status(alice.page, "Links saved to your account.")
  await alice.page.getByRole("link", { name: "Profile details", exact: true }).click()
  await alice.page.getByLabel("First name (required)").fill("Alice")
  await alice.page.getByLabel("Last name (required)").fill("Example")
  await alice.page.getByLabel("Email (optional)").fill(people.alice.email)
  await alice.page.getByRole("button", { name: "Save profile", exact: true }).click()
  await status(alice.page, "Profile saved to your account.")
  assert.equal(await alice.page.evaluate(key => localStorage.getItem(key), storageKey), null)
  await alice.page.reload()
  await alice.page.getByLabel("First name (required)").waitFor()
  assert.equal(await alice.page.getByLabel("First name (required)").inputValue(), "Alice")
  await alice.page.getByRole("link", { name: "Links", exact: true }).click()
  assert.equal(await alice.page.getByLabel("Link URL").first().inputValue(), "https://github.com/alice")
  await widths(alice.page, "account-links")
  log("Alice's links and profile save to her account and survive a reload.")

  // 3. Bob, in another browser, starts empty and cannot read Alice's data.
  const bob = await open(browsers[1], "bob")
  const bobCallback = await signIn(bob, people.bob)
  // A callback that arrives twice (a double navigation or a prefetch) shows the
  // session the first one made, not "Sign-in expired" (@royer/auth rc.5, #28).
  assert.ok(bobCallback, "the sign-in passed through the federation callback")
  await bob.page.goto(bobCallback)
  // Settle on whichever result the app shows, then keep a picture of it.
  await Promise.any([
    bob.page.getByText(`Signed in as ${people.bob.name} (${people.bob.email})`).waitFor(),
    bob.page.getByRole("region", { name: "Sign-in expired" }).waitFor(),
    bob.page.getByText("That sign-in expired or was already used.").waitFor(),
  ])
  await bob.page.screenshot({ path: `${out}/repeat-callback.png` })
  await bob.page.waitForURL(`${APP}/account`)
  await bob.page.getByText(`Signed in as ${people.bob.name} (${people.bob.email})`).waitFor()
  assert.equal(await bob.page.getByRole("region", { name: "Sign-in expired" }).count(), 0)
  log("A repeated sign-in callback keeps Bob's session instead of showing it as expired.")
  await bob.page.goto(`${APP}/dashboard/links`)
  await bob.page.getByRole("heading", { name: "Let’s get you started" }).waitFor()
  const bobAccount = await (await bob.page.request.get(`${APP}/api/account`)).json()
  assert.equal(bobAccount.user.email, people.bob.email)
  assert.equal(bobAccount.profile.document, null)
  assert.ok(!JSON.stringify(bobAccount).includes("alice"))
  log("Bob's account is empty; Alice's data stays hers.")

  // 4. Alice publishes her name and links, but not her email.
  await alice.page.goto(`${APP}/account`)
  await alice.page.getByLabel("Publish my profile page").check()
  assert.equal(await alice.page.getByLabel("Show my email").isChecked(), false)
  await alice.page.getByRole("button", { name: "Save public profile", exact: true }).click()
  await status(alice.page, "Public profile saved.")
  const publicHref = await alice.page.getByRole("link", { name: "Open your public profile" }).getAttribute("href")
  assert.match(publicHref, /^\/p\/[a-z0-9]{12}$/)
  await widths(alice.page, "account-published")
  const visitor = await open(browsers[1], "visitor")
  await visitor.page.goto(`${APP}${publicHref}`)
  await visitor.page.getByRole("heading", { name: "Alice Example" }).waitFor()
  assert.equal(await visitor.page.locator(".saved-links a").count(), 2)
  assert.ok(!(await visitor.page.content()).includes(people.alice.email), "hidden email is not served")
  await widths(visitor.page, "public-profile")
  log("A signed-out visitor sees Alice's published name and links, without her email.")

  // 5. An ended session is shown as expired, never as guest mode, and signing
  //    in again returns to the same page.
  await alice.context.clearCookies({ domain: "devlinks.localhost" })
  await alice.page.goto(`${APP}/dashboard/links`)
  await alice.page.getByRole("region", { name: "Sign-in expired" }).waitFor()
  assert.equal(await alice.page.getByText("Guest mode.").count(), 0)
  await alice.page.getByRole("button", { name: "Sign in again", exact: true }).click()
  await alice.page.waitForURL(`${APP}/dashboard/links`)
  await alice.page.getByText("Signed in as Alice Example. Saves go to your account.").waitFor()
  assert.equal(await alice.page.getByLabel("Link URL").first().inputValue(), "https://github.com/alice")
  await alice.page.goto(`${APP}/account`)
  log("An expired session asks Alice to sign in again and returns her to her account.")

  // 6. Unpublishing takes the page down; signing out returns to guest mode.
  await alice.page.getByLabel("Publish my profile page").uncheck()
  await alice.page.getByRole("button", { name: "Save public profile", exact: true }).click()
  await status(alice.page, "Public profile saved.")
  const gone = await visitor.page.goto(`${APP}${publicHref}`)
  assert.equal(gone?.status(), 404)
  await alice.page.getByRole("button", { name: "Sign out of Devlinks", exact: true }).click()
  await alice.page.getByRole("heading", { name: "Save your profile to your account" }).waitFor()
  await alice.page.goto(`${APP}/dashboard/links`)
  await alice.page.getByText("Guest mode. Saves stay in this browser.").waitFor()
  log("Unpublishing removes the public page; signing out returns Alice to guest mode.")

  rows = await database.query('select count(*)::int as n from "devlinks_preview"."devlinks_profiles"')
  assert.equal(rows.rows[0].n, 1, "only Alice saved; signing in alone stores no profile")
  assert.deepEqual(errors, [])
  await writeFile(`${out}/results.json`, JSON.stringify({ results, errors }, null, 2))
  console.log(JSON.stringify({ passed: results.length, errors }))
} catch (error) {
  for (const [index, { label, page }] of pages.entries()) {
    console.error(`${label} stopped at ${new URL(page.url()).pathname}`)
    console.error((await page.locator("main").innerText().catch(() => "")).slice(0, 500))
    await page.screenshot({ path: `${out}/failure-${index}.png`, fullPage: true }).catch(() => undefined)
  }
  throw error
} finally {
  for (const step of cleanup.reverse()) await Promise.resolve().then(step).catch(() => undefined)
}
