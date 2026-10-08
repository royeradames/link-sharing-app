import type { Draft, SavedDocument } from "./draft"
import type { Publishing } from "./publishing"

export type AccountProfile = {
  document: SavedDocument | null
  publicId: string | null
  publishing: Publishing
  publishingRevision: string | null
}
export type SignedIn = {
  state: "signed_in"
  user: { name: string; email: string }
  profile: AccountProfile
}
export type AccountView =
  | SignedIn
  | { state: "signed_out" }
  /** Signed in earlier in this browser, but the session has ended. */
  | { state: "expired" }
  | { state: "unavailable" }
  | { state: "coming_soon" }

const states = ["signed_in", "signed_out", "unavailable", "coming_soon"]

/** The current account. Any failure to tell is "unavailable", never "signed out". */
export async function fetchAccount(): Promise<AccountView> {
  try {
    const response = await fetch("/api/account", { cache: "no-store" })
    const body = (await response.json()) as AccountView
    if (states.includes(body?.state)) return body
  } catch {}
  return { state: "unavailable" }
}

export type WriteResult =
  | { kind: "saved"; view: SignedIn }
  | { kind: "conflict" | "signed_out" | "failed"; message: string }

async function write(path: string, body: unknown): Promise<WriteResult> {
  try {
    const response = await fetch(path, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const result = (await response.json().catch(() => ({}))) as
      | SignedIn
      | { error?: string }
    if (response.ok && "state" in result && result.state === "signed_in")
      return { kind: "saved", view: result }
    if (response.status === 401)
      return {
        kind: "signed_out",
        message:
          "Your sign-in expired, so nothing was saved. Your edits are still here. Sign in again to save them.",
      }
    const message =
      "error" in result && result.error
        ? result.error
        : "Nothing was saved. Try again in a moment; your edits are still here."
    return { kind: response.status === 409 ? "conflict" : "failed", message }
  } catch {
    return {
      kind: "failed",
      message:
        "Nothing was saved because Devlinks could not be reached. Your edits are still here.",
    }
  }
}

export function saveAccountDraft(draft: Draft, expectedRevision: string | null) {
  return write("/api/account/profile", { expectedRevision, draft })
}
export function saveAccountPublishing(
  publishing: Publishing,
  expectedRevision: string | null
) {
  return write("/api/account/publishing", { expectedRevision, publishing })
}

/** Starts central sign-in and returns the issuer address to open. */
export async function startSignIn(returnPath: string): Promise<string> {
  const response = await fetch("/api/auth/federation/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ returnPath }),
  }).catch(() => null)
  const body = (await response?.json().catch(() => null)) as { url?: string } | null
  const url = body?.url ? new URL(body.url) : null
  if (!response?.ok || !url || !["https:", "http:"].includes(url.protocol) || url.username || url.password)
    throw new Error("Sign-in is temporarily unavailable. Try again in a moment.")
  return url.href
}

/** Signs out of Devlinks in this browser. The Breakthrough account stays signed in. */
export async function signOutOfDevlinks() {
  const response = await fetch("/api/auth/sign-out", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  }).catch(() => null)
  if (!response?.ok) throw new Error("Could not finish signing out. Please try again.")
}
