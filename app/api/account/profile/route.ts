import * as z from "zod/mini"
import { draftSchema, MAX_DOCUMENT_CHARS } from "../../../../lib/draft.ts"
import { json, readJson } from "../../../../lib/server/http.ts"
import { InvalidDraft, saveDraft } from "../../../../lib/server/profile-store.ts"
import { signedIn, signedOwner } from "../session.ts"

export const dynamic = "force-dynamic"
const body = z.strictObject({
  expectedRevision: z.nullable(z.uuid()),
  draft: draftSchema
})

/** Saves the signed-in person's whole draft as a new revision. */
export async function PUT(request: Request) {
  const signed = await signedOwner(request, { write: true })
  if (signed instanceof Response) return signed
  const parsed = body.safeParse(await readJson(request, MAX_DOCUMENT_CHARS + 1024))
  if (!parsed.success)
    return json({ error: "Check the highlighted fields. Nothing was saved." }, 400)
  try {
    const result = await saveDraft(
      signed.runtime.db,
      signed.owner,
      parsed.data.expectedRevision,
      parsed.data.draft
    )
    if (result.kind === "conflict")
      return json(
        {
          state: "conflict",
          error:
            "Your saved profile changed in another tab or device. Your edits are still here. Load the saved profile before saving again.",
        },
        409
      )
    return signedIn(signed, result.profile)
  } catch (error) {
    if (error instanceof InvalidDraft || error instanceof z.core.$ZodError)
      return json({ error: "This profile is too large to save. Choose a smaller image." }, 400)
    console.error(JSON.stringify({ event: "profile_save_failed" }))
    return json({ error: "Your profile was not saved. Try again in a moment; your edits are still here." }, 503)
  }
}
