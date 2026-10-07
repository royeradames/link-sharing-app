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
  type Section
} from "@/lib/draft"
import {
  readDraft,
  resetDraft,
  saveDraft,
  type ReadResult
} from "@/lib/local-draft"

function useEditorState() {
  const form = useForm({ defaultValues: emptyDraft() })
  const [loaded, setLoaded] = useState<ReadResult | { kind: "loading" }>({
    kind: "loading"
  })
  const [notice, setNotice] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    void readDraft().then(result => {
      if (!alive) return
      setLoaded(result)
      if (result.kind === "ready")
        form.reset(result.document?.draft ?? emptyDraft(), {
          keepDefaultValues: true
        })
    })
    const changed = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) {
        reloadSequence.current += 1
        setExternalChange(true)
      }
    }
    window.addEventListener("storage", changed)
    return () => {
      alive = false
      reloadSequence.current += 1
      window.removeEventListener("storage", changed)
    }
  }, [form])
  async function save(section: Section) {
    setErrors({})
    setNotice("")
    if (loaded.kind !== "ready" || saving || imageReading) return
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
      setNotice("Check the highlighted fields. Nothing was saved.")
      return
    }
    setSaving(true)
    const candidate =
      section === "links"
        ? { ...saved, links: linksSchema.parse(values.links) }
        : { ...saved, profile: profileSchema.parse(values.profile) }
    const result = await saveDraft(candidate, loaded.raw)
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
    setNotice(
      section === "links"
        ? "Links saved in this browser."
        : "Profile saved in this browser."
    )
  }
  async function reloadSaved() {
    if (saving || imageReading) return
    if (!window.confirm("Discard unsaved edits and load the saved draft?"))
      return
    const sequence = ++reloadSequence.current
    const values = form.state.values
    const result = await readDraft()
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
    setNotice("Saved draft loaded.")
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
export function EditorProvider({ children }: { children: ReactNode }) {
  const editor = useEditorState()
  return (
    <EditorContext.Provider value={editor}>{children}</EditorContext.Provider>
  )
}
export function useEditor() {
  const editor = useContext(EditorContext)
  if (!editor) throw new Error("EditorProvider is required.")
  return editor
}
