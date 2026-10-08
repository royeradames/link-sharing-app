"use client"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode
} from "react"
import { useForm } from "@tanstack/react-form"
import {
  emptyDraft,
  linksSchema,
  profileSchema,
  STORAGE_KEY,
  type Draft,
  type Section
} from "@/lib/draft"
import {
  readDraft,
  resetDraft,
  saveDraft,
  type ReadResult,
  type SaveResult
} from "@/lib/local-draft"
import {
  fetchAccount,
  saveAccountDraft,
  type AccountView,
  type SignedIn
} from "@/lib/account-client"

/** Whether central accounts exist on this deployment, and their registered origin. */
export type AccountsConfig = { enabled: boolean; origin: string | null }
/**
 * Where saves go. "browser" is the guest editor (and the only source where
 * accounts are off). "account" is the signed-in person's server profile.
 * "checking" means the account could not be checked yet: nothing is loaded
 * from either place, so account data is never mixed with this browser's.
 */
export type DraftSource = "browser" | "account" | "checking"
const accountUnavailable =
  "Your account could not be checked, so nothing was loaded. Your current edits are still available."
const signInEnded =
  "Your sign-in ended. Open Account in a new tab to sign in again; your edits are still here."
function accountResult(view: SignedIn): ReadResult {
  const document = view.profile.document
  return {
    kind: "ready",
    raw: document ? JSON.stringify(document) : null,
    document
  }
}

function busyNotice(imageReading: boolean) {
  return imageReading
    ? "Still checking the image. Try again when it finishes."
    : "Still saving. Try again when it finishes."
}
function useEditorState(accounts: AccountsConfig) {
  const form = useForm({ defaultValues: emptyDraft() })
  const [source, setSource] = useState<DraftSource>(
    accounts.enabled ? "checking" : "browser"
  )
  const [account, setAccount] = useState<AccountView | null>(null)
  const [loaded, setLoaded] = useState<ReadResult | { kind: "loading" }>({
    kind: "loading"
  })
  const [notice, setNotice] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Bumped after a failed save so focus lands on the first invalid field
  // once the errors have rendered.
  const [invalidFocus, setInvalidFocus] = useState(0)
  useEffect(() => {
    if (!invalidFocus) return
    document
      .querySelector<HTMLElement>('#main [aria-invalid="true"]')
      ?.focus()
  }, [invalidFocus])
  const [saving, setSaving] = useState(false)
  const reloadSequence = useRef(0)
  const [imageReading, updateImageReading] = useState(false)
  const setImageReading = useCallback((reading: boolean) => {
    if (reading) reloadSequence.current += 1
    updateImageReading(reading)
  }, [])
  const [externalChange, setExternalChange] = useState(false)
  const saved =
    loaded.kind === "ready"
      ? (loaded.document?.draft ?? emptyDraft())
      : emptyDraft()
  useEffect(() => {
    let alive = true
    // Accounts off: the browser-local editor, exactly as before accounts.
    // Accounts on: ask the server first; a guest falls back to this browser.
    const initial: Promise<ReadResult> = accounts.enabled
      ? fetchAccount().then(view => {
          if (!alive) return { kind: "unavailable", message: "" }
          setAccount(view)
          if (view.state === "signed_in") {
            setSource("account")
            return accountResult(view)
          }
          if (view.state === "unavailable")
            return { kind: "unavailable", message: accountUnavailable }
          setSource("browser")
          return readDraft()
        })
      : readDraft()
    void initial.then(result => {
      if (!alive) return
      setLoaded(result)
      if (result.kind === "ready")
        form.reset(result.document?.draft ?? emptyDraft(), {
          keepDefaultValues: true
        })
    })
    return () => {
      alive = false
      reloadSequence.current += 1
    }
  }, [form, accounts.enabled])
  useEffect(() => {
    // Other tabs only signal changes to this browser's own draft.
    if (source !== "browser") return
    const changed = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        reloadSequence.current += 1
        setExternalChange(true)
      }
    }
    window.addEventListener("storage", changed)
    return () => window.removeEventListener("storage", changed)
  }, [source])
  /** Reads the saved draft from wherever saves currently go. */
  async function readCurrent(): Promise<ReadResult> {
    if (source === "browser") return readDraft()
    const view = await fetchAccount()
    if (view.state === "signed_in") {
      setAccount(view)
      setSource("account")
      return accountResult(view)
    }
    if (view.state === "unavailable")
      return { kind: "unavailable", message: accountUnavailable }
    // Signed out after a failed check: this is a guest after all.
    if (source === "checking") {
      setAccount(view)
      setSource("browser")
      return readDraft()
    }
    return { kind: "unavailable", message: signInEnded }
  }
  async function saveToAccount(
    candidate: Draft,
    expectedRevision: string | null
  ): Promise<SaveResult> {
    const outcome = await saveAccountDraft(candidate, expectedRevision)
    if (outcome.kind !== "saved")
      return { kind: "failed", message: outcome.message }
    setAccount(outcome.view)
    const document = outcome.view.profile.document
    if (!document)
      return { kind: "failed", message: "Nothing was saved. Try again." }
    return { kind: "saved", raw: JSON.stringify(document), document }
  }
  async function save(section: Section) {
    if (saving || imageReading) {
      setNotice(busyNotice(imageReading))
      return
    }
    setErrors({})
    setNotice("")
    if (loaded.kind !== "ready") return
    reloadSequence.current += 1
    const values = form.state.values
    const checked =
      section === "links"
        ? linksSchema.safeParse(values.links)
        : profileSchema.safeParse(values.profile)
    if (!checked.success) {
      const nextErrors: Record<string, string> = {}
      for (const issue of checked.error.issues) {
        const linkId =
          section === "links" && typeof issue.path[0] === "number"
            ? values.links[issue.path[0]]?.id
            : undefined
        const path = linkId
          ? ["links", linkId, ...issue.path.slice(1)]
          : [section, ...issue.path]
        nextErrors[path.join(".")] = issue.message
      }
      setErrors(nextErrors)
      setInvalidFocus(count => count + 1)
      setNotice("Check the highlighted fields. Nothing was saved.")
      return
    }
    setSaving(true)
    const candidate =
      section === "links"
        ? { ...saved, links: linksSchema.parse(values.links) }
        : { ...saved, profile: profileSchema.parse(values.profile) }
    const result =
      source === "account"
        ? await saveToAccount(candidate, loaded.document?.revision ?? null)
        : await saveDraft(candidate, loaded.raw)
    setSaving(false)
    if (result.kind === "failed") {
      setNotice(result.message)
      return
    }
    setLoaded({ kind: "ready", raw: result.raw, document: result.document })
    // Only the submitted section is normalized. The other section's unsaved edits stay intact.
    if (
      section === "links" &&
      JSON.stringify(form.state.values.links) === JSON.stringify(values.links)
    )
      form.setFieldValue("links", result.document.draft.links)
    if (
      section === "profile" &&
      JSON.stringify(form.state.values.profile) ===
        JSON.stringify(values.profile)
    )
      form.setFieldValue("profile", result.document.draft.profile)
    setExternalChange(false)
    const where = source === "account" ? "to your account" : "in this browser"
    setNotice(
      section === "links" ? `Links saved ${where}.` : `Profile saved ${where}.`
    )
  }
  async function reloadSaved() {
    if (saving || imageReading) {
      setNotice(busyNotice(imageReading))
      return
    }
    if (!window.confirm("Discard unsaved edits and load the saved draft?"))
      return
    const sequence = ++reloadSequence.current
    const values = form.state.values
    const result = await readCurrent()
    if (sequence !== reloadSequence.current) return
    // TanStack replaces its values object on edits. Never apply a decoded snapshot over newer work.
    if (values !== form.state.values) {
      setNotice(
        "Load canceled because you made newer edits. Your edits are still here."
      )
      return
    }
    if (result.kind !== "ready" && loaded.kind === "ready") {
      setNotice(result.message)
      return
    }
    setLoaded(result)
    if (result.kind !== "ready") return
    form.reset(result.document?.draft ?? emptyDraft(), {
      keepDefaultValues: true
    })
    setExternalChange(false)
    setErrors({})
    setNotice(source === "account" ? "Saved profile loaded." : "Saved draft loaded.")
  }
  async function resetCorrupt() {
    if (
      loaded.kind !== "corrupt" ||
      !window.confirm(
        "Remove only this unreadable local draft? Download its backup first. This cannot be undone."
      )
    )
      return
    reloadSequence.current += 1
    if (!(await resetDraft(loaded.raw))) {
      setNotice(
        "The draft changed or could not be reset. Reload it before trying again."
      )
      return
    }
    setLoaded({ kind: "ready", raw: null, document: null })
    form.reset(emptyDraft())
    setNotice("Local draft reset.")
  }
  function downloadBackup() {
    if (loaded.kind !== "corrupt") return
    const url = URL.createObjectURL(
      new Blob([loaded.raw], { type: "application/json" })
    )
    const a = document.createElement("a")
    a.href = url
    a.download = "devlinks-draft-backup.json"
    a.click()
    URL.revokeObjectURL(url)
  }
  return {
    accounts,
    source,
    account,
    setAccount,
    form,
    loaded,
    saved,
    notice,
    setNotice,
    errors,
    saving,
    imageReading,
    setImageReading,
    externalChange,
    save,
    reloadSaved,
    resetCorrupt,
    downloadBackup
  }
}
const EditorContext = createContext<ReturnType<typeof useEditorState> | null>(
  null
)
export function EditorProvider({
  accounts,
  children
}: {
  accounts: AccountsConfig
  children: ReactNode
}) {
  const editor = useEditorState(accounts)
  return (
    <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
  )
}
export function useEditor() {
  const editor = useContext(EditorContext)
  if (!editor) throw new Error("EditorProvider is required.")
  return editor
}
