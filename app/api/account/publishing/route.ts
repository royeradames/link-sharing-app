import { json, readJson } from "../../../../lib/server/http.ts"
import { savePublishing } from "../../../../lib/server/profile-store.ts"
import { publishingSchema } from "../../../../lib/publishing.ts"
import { signedIn, signedOwner } from "../session.ts"

export const dynamic = "force-dynamic"

/** Saves what the signed-in person shows on their public page. */
export async function PUT(request: Request) {
  const signed = await signedOwner(request, { write: true })
  if (signed instanceof Response) return signed
  const parsed = publishingSchema.safeParse(await readJson(request, 1024))
  if (!parsed.success)
    return json({ error: "Choose what to publish and try again." }, 400)
  try {
    const profile = await savePublishing(signed.runtime.db, signed.owner, parsed.data)
    if (!profile)
      return json(
        { error: "Save your links or profile first, then choose what to publish." },
        409
      )
    return signedIn(signed, profile)
  } catch {
    console.error(JSON.stringify({ event: "publishing_save_failed" }))
    return json({ error: "Your public profile settings were not saved. Try again in a moment." }, 503)
  }
}
