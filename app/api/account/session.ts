import type { AccountProfile } from "../../../lib/server/profile-store.ts"
import { ownerFor } from "../../../lib/server/profile-store.ts"
import { json } from "../../../lib/server/http.ts"
import {
  currentAccount,
  serverRuntime,
  type Runtime,
} from "../../../lib/server/runtime.ts"
import type { Owner } from "../../../lib/server/profile-store.ts"

type Signed = {
  runtime: Runtime
  owner: Owner
  user: { name: string; email: string }
}

/**
 * Resolves the signed-in owner of an account request, or the response to
 * send instead: 404 where accounts are coming soon, 403 for another site's
 * write, 401 when signed out and 503 when the account cannot be checked.
 */
export async function signedOwner(
  request: Request,
  { write }: { write: boolean }
): Promise<Signed | Response> {
  const runtime = serverRuntime()
  if (!runtime) return json({ state: "coming_soon" }, 404)
  if (write && request.headers.get("origin") !== runtime.origin)
    return json({ error: "This change must come from Devlinks itself." }, 403)
  const account = await currentAccount(runtime, request.headers)
  if (account.state === "signed_out") return json({ state: "signed_out" }, 401)
  const unavailable = json(
    {
      state: "unavailable",
      error: "Your account could not be checked. Try again in a moment.",
    },
    503
  )
  if (account.state === "unavailable") return unavailable
  try {
    const owner = await ownerFor(runtime, account.id)
    if (!owner) return unavailable
    return { runtime, owner, user: { name: account.name, email: account.email } }
  } catch {
    console.error(JSON.stringify({ event: "account_owner_failed" }))
    return unavailable
  }
}

export function signedIn(signed: Signed, profile: AccountProfile) {
  return json({ state: "signed_in", user: signed.user, profile })
}
