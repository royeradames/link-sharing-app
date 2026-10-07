import {
  documentSchema,
  MAX_DOCUMENT_CHARS,
  parseDocument,
  STORAGE_KEY,
  type Draft,
  type SavedDocument,
} from "./draft"
import { validateStoredImage } from "./profile-image"

export type ReadResult =
  | { kind: "ready"; raw: string | null; document: SavedDocument | null }
  | { kind: "unavailable"; message: string }
  | { kind: "corrupt"; raw: string; message: string }
export async function readDraft(): Promise<ReadResult> {
  let raw: string | null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    return {
      kind: "unavailable",
      message:
        "This browser cannot read saved drafts. Your current edits are still available.",
    }
  }
  if (raw === null) return { kind: "ready", raw, document: null }
  try {
    const document = parseDocument(raw)
    await validateStoredImage(document.draft.profile.image)
    return { kind: "ready", raw, document }
  } catch {
    return {
      kind: "corrupt",
      raw,
      message:
        "The saved draft could not be read. It has not been changed. Download a backup before resetting it.",
    }
  }
}
export type SaveResult =
  | { kind: "saved"; raw: string; document: SavedDocument }
  | { kind: "failed"; message: string }
export async function saveDraft(
  draft: Draft,
  expectedRaw: string | null
): Promise<SaveResult> {
  if (!navigator.locks)
    return {
      kind: "failed",
      message:
        "This browser cannot safely save drafts. Use a current browser; your edits are still here.",
    }
  try {
    return await navigator.locks.request(STORAGE_KEY, async () => {
      if (localStorage.getItem(STORAGE_KEY) !== expectedRaw)
        return {
          kind: "failed" as const,
          message:
            "Another tab changed the saved draft. Your edits are still here. Load the saved draft before saving again.",
        }
      const document = documentSchema.parse({
        version: 1,
        revision: crypto.randomUUID(),
        draft,
      })
      await validateStoredImage(document.draft.profile.image)
      const raw = JSON.stringify(document)
      if (raw.length > MAX_DOCUMENT_CHARS)
        return {
          kind: "failed" as const,
          message: "This draft is too large to save. Choose a smaller image.",
        }
      localStorage.setItem(STORAGE_KEY, raw)
      return { kind: "saved" as const, raw, document }
    })
  } catch {
    return {
      kind: "failed",
      message:
        "The draft was not saved. Browser storage may be full or unavailable. Your previous saved draft and current edits are unchanged.",
    }
  }
}
export async function resetDraft(expectedRaw: string): Promise<boolean> {
  if (!navigator.locks) return false
  try {
    return await navigator.locks.request(STORAGE_KEY, () => {
      if (localStorage.getItem(STORAGE_KEY) !== expectedRaw) return false
      localStorage.removeItem(STORAGE_KEY)
      return true
    })
  } catch {
    return false
  }
}
