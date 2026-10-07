"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEditor } from "./editor-provider"
import type { ReactNode } from "react"

export function EditorShell({ children }: { children: ReactNode }) {
  const path = usePathname()
  const editor = useEditor()
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <Link
          href="/"
          aria-label="Devlinks local editor home"
          className="brand"
        >
          <Image
            src="/assets/logo/devlinks.svg"
            width={146}
            height={32}
            alt="devlinks"
            priority
          />
        </Link>
        <nav aria-label="Editor">
          <Link
            href="/dashboard/links"
            aria-current={path === "/dashboard/links" ? "page" : undefined}
          >
            Links
          </Link>
          <Link
            href="/dashboard/profile-details"
            aria-current={
              path === "/dashboard/profile-details" ? "page" : undefined
            }
          >
            Profile details
          </Link>
        </nav>
        <Link className="button secondary" href="/preview">
          Saved preview
        </Link>
      </header>
      <p className="local-notice">
        Local editor preview. Saves stay in this browser. Accounts and public
        profile pages are not available yet.
      </p>
      <main id="main" tabIndex={-1}>
        {editor.loaded.kind === "loading" ? (
          <p className="panel">Loading your local draft…</p>
        ) : (
          children
        )}
        {editor.loaded.kind === "unavailable" && (
          <section className="storage-warning" aria-label="Storage unavailable">
            <p>{editor.loaded.message} Saving is unavailable.</p>
            <button
              className="button secondary"
              onClick={() => void editor.reloadSaved()}
            >
              Retry loading saved draft
            </button>
          </section>
        )}
        {editor.loaded.kind === "corrupt" && (
          <section className="storage-warning" aria-label="Draft recovery">
            <p>{editor.loaded.message}</p>
            <button
              className="button secondary"
              onClick={editor.downloadBackup}
            >
              Download existing draft
            </button>
            <button
              className="button secondary"
              onClick={() => void editor.resetCorrupt()}
            >
              Reset unreadable draft
            </button>
          </section>
        )}
        {editor.externalChange && (
          <section className="storage-warning" role="status">
            <p>
              Another tab changed the saved draft. Your current edits are still
              here.
            </p>
            <button
              className="button secondary"
              onClick={() => void editor.reloadSaved()}
            >
              Load saved draft
            </button>
          </section>
        )}
        <p className="status" role="status" aria-live="polite">
          {editor.notice}
        </p>
      </main>
      <footer>
        <details className="keyboard-help">
          <summary>Keyboard help</summary>
          <p>
            Tab moves between controls. Enter or Space activates a button. Use
            Move up and Move down to reorder links. Escape closes a platform
            picker. Your browser’s shortcuts keep working.
          </p>
        </details>
      </footer>
    </>
  )
}
