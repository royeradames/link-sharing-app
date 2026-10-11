// Royer, October 10, 2026: adding an app must be automatic, with no token. On Vercel with its
// database, Devlinks is a suite app and needs no AUTH_* setting at all.
import test from "node:test"
import assert from "node:assert/strict"
import { accountSettings } from "../lib/server/accounts.ts"

const database = "postgres://synthetic@127.0.0.1:9/unavailable"
const production = {
  VERCEL: "1",
  VERCEL_ENV: "production",
  VERCEL_PROJECT_PRODUCTION_URL: "link-sharing-app.royeradames.com",
  POSTGRES_URL_NON_POOLING: database,
}

test("on Vercel with a database and no registration, Devlinks is a suite app", () => {
  assert.deepEqual(accountSettings(production), {
    mode: "suite",
    baseURL: "https://link-sharing-app.royeradames.com",
    issuerURL: "https://accounts.royeradames.com/api/auth",
    databaseURL: database,
  })
  const preview = accountSettings({
    ...production,
    VERCEL_ENV: "preview",
    VERCEL_BRANCH_URL: "link-sharing-app-git-feat-x-royer-adames-projects.vercel.app",
  })
  assert.equal(preview?.baseURL, "https://link-sharing-app-git-feat-x-royer-adames-projects.vercel.app")
})

test("without a database or off Vercel, accounts stay off; a registration still wins", () => {
  assert.equal(accountSettings({ ...production, POSTGRES_URL_NON_POOLING: "" }), null)
  assert.equal(accountSettings({ POSTGRES_URL_NON_POOLING: database }), null)
  const registered = accountSettings({
    ...production,
    AUTH_BASE_URL: "https://link-sharing-app.royeradames.com",
    AUTH_SECRET: "synthetic-test-configuration-only-32-characters",
    AUTH_ISSUER_URL: "https://accounts.royeradames.com/api/auth",
    AUTH_CLIENT_ID: "synthetic-client",
    AUTH_CLIENT_SECRET: "synthetic-client-secret",
  })
  assert.equal(registered?.mode, "registered")
})
