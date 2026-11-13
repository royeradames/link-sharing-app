"use client"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useEditor } from "./editor-provider"
import { useState, type ReactNode } from "react"

export function EditorShell({ children }: { children: ReactNode }) {
  const path = usePathname()
  const editor = useEditor()
  // The welcome page never reads the draft; showing it at once avoids a
  // loading panel that later grows into the real content.
  const waitingForDraft = editor.loaded.kind === "loading" && path !== "/"
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
            className="brand-wide"
            src="/assets/logo/devlinks.svg"
            width={146}
            height={32}
            alt="Devlinks"
            priority
          />
          <Image
            className="brand-narrow"
            src="/assets/logo/link-circle-bold.svg"
            width={32}
            height={32}
            alt="Devlinks"
          />
        </Link>
        <nav aria-label="Editor">
          <Link
            href="/dashboard/links"
            aria-current={path === "/dashboard/links" ? "page" : undefined}
          >
            <span className="nav-icon icon-links" aria-hidden="true" />
            <span className="nav-label">Links</span>
          </Link>
          <Link
            href="/dashboard/profile-details"
            aria-current={
              path === "/dashboard/profile-details" ? "page" : undefined
            }
          >
            <span className="nav-icon icon-profile" aria-hidden="true" />
            <span className="nav-label">Profile details</span>
          </Link>
          {editor.accounts.enabled && (
            <Link
              href="/account"
              aria-current={path === "/account" ? "page" : undefined}
            >
              <span className="nav-icon icon-account" aria-hidden="true" />
              <span className="nav-label">Account</span>
            </Link>
          )}
        </nav>
        <Link className="button secondary preview-link" href="/preview">
          <span className="nav-icon icon-preview" aria-hidden="true" />
          <span className="nav-label">Saved preview</span>
        </Link>
      </header>
      <p className="local-notice">
        <SourceNotice />
      </p>
      <main id="main" tabIndex={-1}>
        {waitingForDraft ? (
          <p className="panel">
            {editor.accounts.enabled
              ? "Loading your saved profile…"
              : "Loading your local draft…"}
          </p>
        ) : (
          children
        )}
        {editor.account?.state === "expired" ? (
          <ExpiredSignIn />
        ) : (
          editor.loaded.kind === "unavailable" && (
            <section
              className="storage-warning"
              aria-label={
                editor.source === "browser"
                  ? "Storage unavailable"
                  : "Account unavailable"
              }
            >
              <p>{editor.loaded.message} Saving is unavailable.</p>
              <RetryButton />
            </section>
          )
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

/** Says where saves go right now. */
function SourceNotice() {
  const { accounts, source, account } = useEditor()
  if (!accounts.enabled)
    return (
      <>
        Local editor preview. Saves stay in this browser. Accounts and public
        profile pages are coming soon.
      </>
    )
  if (account?.state === "expired")
    return <>Your sign-in expired. Saving to your account is paused.</>
  if (account?.state === "unavailable")
    return <>Your account could not be checked. Saving is paused.</>
  if (source === "account" && account?.state === "signed_in")
    return <>Signed in as {account.user.name || account.user.email}. Saves go to your account.</>
  if (source === "browser")
    return (
      <>
        Guest mode. Saves stay in this browser. Sign in from Account to save to
        your account and publish a profile page.
      </>
    )
  return <>Checking your account…</>
}

/** Retries loading; busy, not disabled, while the check runs. */
function RetryButton() {
  const editor = useEditor()
  const [busy, setBusy] = useState(false)
  return (
    <button
      className="button secondary"
      aria-busy={busy || undefined}
      aria-disabled={busy || undefined}
      onClick={async () => {
        if (busy) return
        setBusy(true)
        await editor.reloadSaved()
        setBusy(false)
      }}
    >
      {editor.source === "browser"
        ? "Retry loading saved draft"
        : "Check my account again"}
    </button>
  )
}

/** An ended session: sign in again (edits kept) or continue as a guest. */
export function ExpiredSignIn() {
  const editor = useEditor()
  const [busy, setBusy] = useState(false)
  return (
    <section className="storage-warning" aria-label="Sign-in expired">
      <p>
        Your sign-in expired. Sign in again to keep saving to your account;
        your unsaved edits come back with you. Or continue as a guest in this
        browser.
      </p>
      <button
        className="button"
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        onClick={async () => {
          if (busy) return
          setBusy(true)
          await editor.reauthenticate().catch(() => setBusy(false))
        }}
      >
        {busy ? "Opening sign-in…" : "Sign in again"}
      </button>
      <button
        className="button secondary"
        aria-disabled={busy || undefined}
        onClick={() => {
          if (!busy) editor.continueAsGuest()
        }}
      >
        Continue as a guest
      </button>
    </section>
  )
}
