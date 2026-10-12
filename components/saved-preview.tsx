"use client"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { copyText } from "@/lib/draft"
import { useCopyFeedback } from "@/lib/use-copy-feedback"
import { ProfileCard } from "./profile-card"
import { useEditor } from "./editor-provider"
export function SavedPreview() {
  const editor = useEditor()
  const [fallback, setFallback] = useState<string | null>(null)
  const text = useRef<HTMLTextAreaElement>(null)
  // Every press changes the button and the shared notice, so a repeat is seen
  // and announced (catalog CPY1).
  const linksCopy = useCopyFeedback()
  // The notice this button set last, so clearing it never wipes another notice.
  const copyNotice = useRef("")
  const { setNotice } = editor
  useEffect(() => {
    const previous = copyNotice.current
    const next =
      linksCopy.message && linksCopy.state !== "failed"
        ? `${linksCopy.message} This is a list of URLs, not a public profile page.`
        : linksCopy.message
    if (!previous && !next) return
    copyNotice.current = next
    setNotice((current) => (next || current === previous ? next : current))
  }, [linksCopy.message, linksCopy.state, setNotice])
  // Why Copy links can't run yet, or null when it can. The button stays
  // focusable and says why instead of going natively disabled.
  const kind = editor.loaded.kind
  const why =
    kind === "loading"
      ? "Loading your saved links…"
      : kind !== "ready"
        ? "Saved links can't be read right now. The message below the preview says what to do."
        : editor.saved.links.length
          ? null
          : "No saved links to copy yet. Add links in the editor and save them."
  async function copy() {
    const value = why ? "" : copyText(editor.saved)
    if (!value) {
      editor.setNotice(
        kind === "ready"
          ? "Save at least one link in the editor before copying."
          : (why ?? "Nothing to copy yet.")
      )
      return
    }
    if (await linksCopy.copy(value, "the saved links")) {
      setFallback(null)
    } else {
      setFallback(value)
      requestAnimationFrame(() => {
        text.current?.focus()
        text.current?.select()
      })
    }
  }
  return (
    <section className="preview-page">
      <div className="preview-toolbar">
        <Link className="button secondary" href="/dashboard/links">
          Back to editor
        </Link>
        <button
          className="button"
          onClick={() => void copy()}
          aria-disabled={why ? true : undefined}
          aria-busy={kind === "loading" || undefined}
          aria-describedby={why ? "copy-links-why" : undefined}
          data-copy-state={linksCopy.state}
        >
          {linksCopy.state === "idle" ? "Copy links" : linksCopy.label}
        </button>
      </div>
      {why && (
        <p id="copy-links-why" className="muted">
          {why}
        </p>
      )}
      <h1>Saved preview</h1>
      <p className="muted">
        Only saved changes appear here. This preview belongs to this browser and
        is not a public profile URL.
      </p>
      <ProfileCard draft={editor.saved} />
      {fallback !== null && (
        <div className="clipboard-fallback">
          <label htmlFor="copy-links">Saved links to copy</label>
          <textarea
            id="copy-links"
            ref={text}
            readOnly
            value={fallback}
            rows={6}
          />
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              text.current?.focus()
              text.current?.select()
            }}
          >
            Select saved links
          </button>
        </div>
      )}
    </section>
  )
}
