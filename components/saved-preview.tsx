"use client"
import Link from "next/link"
import { useRef, useState } from "react"
import { copyText } from "@/lib/draft"
import { ProfileCard } from "./profile-card"
import { useEditor } from "./editor-provider"
export function SavedPreview() {
  const editor = useEditor()
  const [fallback, setFallback] = useState<string | null>(null)
  const text = useRef<HTMLTextAreaElement>(null)
  async function copy() {
    const value = copyText(editor.saved)
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setFallback(null)
      editor.setNotice(
        "Saved links copied. This is a list of URLs, not a public profile page."
      )
    } catch {
      setFallback(value)
      editor.setNotice(
        "Clipboard access was unavailable. Select and copy the saved links below."
      )
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
          disabled={!editor.saved.links.length}
        >
          Copy links
        </button>
      </div>
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
