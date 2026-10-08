import {
  AuthenticationUnavailableError,
  createFederatedAuth,
  type FederatedAuth,
} from "@royer/auth/federation"
import { getVercelOidcToken } from "@vercel/functions/oidc"
import type pg from "pg"
import { accountSettings, type AccountSettings } from "./accounts.ts"
import { getDatabase } from "./database.ts"

export type Runtime = {
  db: pg.Pool
  accounts: FederatedAuth
  origin: string
  issuerURL: string
}

declare global {
  var __devlinksAccounts: FederatedAuth | undefined
}

/**
 * The Preview issuer sits behind Vercel Deployment Protection. Its Trusted
 * Sources rule admits this project's Preview deployments, which prove
 * themselves with a fresh Vercel OIDC token on every issuer request.
 */
async function trustedSourceHeaders() {
  const token = await getVercelOidcToken()
  if (!token) throw new AuthenticationUnavailableError()
  return { "x-vercel-trusted-oidc-idp-token": token }
}

function configure(db: pg.Pool, settings: AccountSettings) {
  const onVercel = process.env.VERCEL === "1"
  return createFederatedAuth({
    appId: "devlinks",
    appName: "Devlinks",
    baseURL: settings.baseURL,
    secret: settings.secret,
    issuerURL: settings.issuerURL,
    clientId: settings.clientId,
    clientSecret: settings.clientSecret,
    database: db,
    ...(onVercel
      ? {
          issuerRequestHeaders: trustedSourceHeaders,
          ipAddress: { headers: ["x-vercel-forwarded-for"] },
        }
      : {}),
  })
}

/**
 * Accounts and their database, or null when accounts are not configured
 * here. A broken setting turns accounts off ("coming soon") instead of
 * breaking the browser-local editor, which never depends on them. No database
 * connection is opened without account settings.
 */
export function serverRuntime(): Runtime | null {
  let settings: AccountSettings | null
  try {
    settings = accountSettings()
  } catch {
    console.error(JSON.stringify({ event: "account_settings_invalid" }))
    return null
  }
  if (!settings) return null
  let db: pg.Pool
  try {
    db = getDatabase(settings.databaseURL)
  } catch {
    console.error(JSON.stringify({ event: "database_settings_invalid" }))
    return null
  }
  globalThis.__devlinksAccounts ??= configure(db, settings)
  return {
    db,
    accounts: globalThis.__devlinksAccounts,
    origin: settings.baseURL,
    issuerURL: settings.issuerURL,
  }
}

export type AccountCheck =
  | { state: "signed_in"; id: string; name: string; email: string }
  | { state: "signed_out" }
  | { state: "unavailable" }

/** The signed-in person. An unreachable issuer is a retry state, never a guess. */
export async function currentAccount(
  runtime: Runtime,
  headers: Headers
): Promise<AccountCheck> {
  try {
    const principal = await runtime.accounts.getPrincipal(headers)
    return principal
      ? {
          state: "signed_in",
          id: principal.id,
          name: principal.name,
          email: principal.email,
        }
      : { state: "signed_out" }
  } catch (error) {
    const reason =
      error instanceof AuthenticationUnavailableError
        ? "issuer_unavailable"
        : "account_check_failed"
    console.error(JSON.stringify({ event: reason }))
    return { state: "unavailable" }
  }
}
