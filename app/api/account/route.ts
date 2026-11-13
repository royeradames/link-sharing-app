import { readProfile } from "../../../lib/server/profile-store.ts"
import { json } from "../../../lib/server/http.ts"
import { signedIn, signedOwner } from "./session.ts"

export const dynamic = "force-dynamic"

/** The signed-in person and their saved profile, links and publishing choices. */
export async function GET(request: Request) {
  const signed = await signedOwner(request, { write: false })
  if (signed instanceof Response) return signed
  try {
    return signedIn(signed, await readProfile(signed.runtime.db, signed.owner))
  } catch {
    console.error(JSON.stringify({ event: "profile_read_failed" }))
    return json(
      { state: "unavailable", error: "Your profile could not be loaded. Try again in a moment." },
      503
    )
  }
}
