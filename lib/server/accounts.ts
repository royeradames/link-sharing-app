// Central account settings. On Vercel with its database, Devlinks is a suite app:
// its origin is its client ID and Vercel's OIDC token is its credential, so it
// needs no AUTH_* setting (royer-auth suite clients, October 2026). An operator
// registration (every AUTH_* setting) still wins, as the fallback and for local
// development. Without a database, accounts are off ("coming soon").
// This module reads the environment only; it never opens a connection.
import { vercelSuiteSettings } from "@royer/auth/suite"

const loopbackHosts = ["localhost", "127.0.0.1", "[::1]"]
const names = [
  "AUTH_BASE_URL",
  "AUTH_SECRET",
  "AUTH_ISSUER_URL",
  "AUTH_CLIENT_ID",
  "AUTH_CLIENT_SECRET",
] as const

export class AccountSettingsError extends Error {}

/** An exact origin: HTTPS, or HTTP on loopback for local development. */
function exactOrigin(value: string) {
  const url = new URL(value)
  const loopback = loopbackHosts.includes(url.hostname)
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.protocol !== "https:" && !(url.protocol === "http:" && loopback))
  )
    throw new AccountSettingsError(
      "Account addresses must be exact HTTPS origins, or local development origins."
    )
  return url
}

export type AccountSettings =
  | {
      mode: "registered"
      baseURL: string
      secret: string
      issuerURL: string
      clientId: string
      clientSecret: string
      databaseURL: string
    }
  | { mode: "suite"; baseURL: string; issuerURL: string; databaseURL: string }

/** The settings, null when accounts are not configured here, or a thrown error when they are broken. */
export function accountSettings(env = process.env): AccountSettings | null {
  const databaseURL = env.POSTGRES_URL_NON_POOLING?.trim()
  if (!databaseURL) return null
  if (names.every(name => !env[name]?.trim())) {
    const suite = vercelSuiteSettings(env)
    return suite ? { mode: "suite", baseURL: suite.baseURL, issuerURL: suite.issuerURL, databaseURL } : null
  }
  if (names.some(name => !env[name]?.trim())) return null
  const base = exactOrigin(env.AUTH_BASE_URL!)
  const issuer = exactOrigin(env.AUTH_ISSUER_URL!)
  if (base.pathname !== "/" || env.AUTH_SECRET!.length < 32)
    throw new AccountSettingsError("Account settings are incomplete.")
  if (issuer.pathname !== "/api/auth" || issuer.href !== env.AUTH_ISSUER_URL)
    throw new AccountSettingsError(
      "The account issuer must be its exact origin plus /api/auth."
    )
  return {
    mode: "registered",
    baseURL: base.origin,
    secret: env.AUTH_SECRET!,
    issuerURL: issuer.href,
    clientId: env.AUTH_CLIENT_ID!,
    clientSecret: env.AUTH_CLIENT_SECRET!,
    databaseURL,
  }
}

/** What the browser needs to know: whether accounts exist here and their registered origin. */
export function accountsConfig(): { enabled: boolean; origin: string | null } {
  try {
    const settings = accountSettings()
    return settings
      ? { enabled: true, origin: settings.baseURL }
      : { enabled: false, origin: null }
  } catch {
    console.error(JSON.stringify({ event: "account_settings_invalid" }))
    return { enabled: false, origin: null }
  }
}
