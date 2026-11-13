"use client"
import Link from "next/link"
import { useRef, useState } from "react"
import { useForm } from "@tanstack/react-form"
import {
  saveAccountPublishing,
  signOutOfDevlinks,
  startSignIn,
  type SignedIn
} from "@/lib/account-client"
import { defaultPublishing, type Publishing } from "@/lib/publishing"
import { forgetSignedIn, useEditor } from "./editor-provider"

const signInErrors: Record<string, string> = {
  expired: "That sign-in expired or was already used. Start again.",
  unavailable:
    "The Breakthrough account service did not answer. Try again in a moment.",
  linking:
    "This Breakthrough account could not be linked to Devlinks. Try again, or keep editing as a guest."
}
const choices = [
  { name: "name", label: "Show my name" },
  { name: "email", label: "Show my email" },
  { name: "image", label: "Show my picture" },
  { name: "links", label: "Show my links" }
] as const

export function AccountPanel() {
  const editor = useEditor()
  const { accounts, account } = editor
  const [busy, setBusy] = useState<"sign-in" | "sign-out" | null>(null)
  // A failed sign-in returns here with ?error=<reason>. The message renders
  // only after the account check, so server and first client render match.
  const [message, setMessage] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (signInErrors[
          new URLSearchParams(window.location.search).get("error") ?? ""
        ] ?? "")
  )

  async function signIn() {
    if (busy) return
    setBusy("sign-in")
    setMessage("")
    // The issuer only returns to the registered address. A deployment URL
    // that is not it goes there first.
    if (accounts.origin && window.location.origin !== accounts.origin) {
      // Another origin (the registered branch address), not an internal route.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign(`${accounts.origin}/account`)
      return
    }
    try {
      window.location.assign(await startSignIn("/account"))
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sign-in is temporarily unavailable."
      )
      setBusy(null)
    }
  }
  async function signOut() {
    if (busy) return
    setBusy("sign-out")
    setMessage("")
    try {
      await signOutOfDevlinks()
      forgetSignedIn()
      // A fresh load returns the editor to this browser's guest draft.
      window.location.reload()
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not finish signing out. Please try again."
      )
      setBusy(null)
    }
  }

  if (!accounts.enabled || account?.state === "coming_soon")
    return (
      <section className="panel account" aria-labelledby="account-title">
        <h1 id="account-title">Accounts are coming soon</h1>
        <p>
          Devlinks accounts and public profile pages are coming soon. The
          editor already works today and keeps your saves in this browser.
        </p>
        <Link className="button" href="/dashboard/links">
          Open local editor
        </Link>
      </section>
    )
  return (
    <section className="panel account" aria-labelledby="account-title">
      <h1 id="account-title">Your account</h1>
      {account && message && (
        <p className="account-message" role="status">
          {message}
        </p>
      )}
      {/* An unavailable check is reported by the editor shell with a retry. */}
      {!account && <p role="status">Checking your account…</p>}
      {account?.state === "signed_out" && (
        <>
          <h2>Save your profile to your account</h2>
          <p>
            Devlinks uses your Breakthrough account, the shared sign-in for
            Breakthrough Development apps. Signed in, your links and profile
            are saved to your account, follow you to any browser, and can be
            published as a public profile page. As a guest, everything stays in
            this browser.
          </p>
          <div className="account-actions">
              <button
                type="button"
                className="button"
                aria-busy={busy === "sign-in" || undefined}
                aria-disabled={busy !== null || undefined}
                onClick={() => void signIn()}
              >
                {busy === "sign-in"
                  ? "Opening sign-in…"
                  : "Sign in with Breakthrough"}
              </button>
              <Link className="button secondary" href="/dashboard/links">
                Keep editing as a guest
              </Link>
            </div>
        </>
      )}
      {account?.state === "signed_in" && (
        <>
          <p>
            Signed in as {account.user.name || account.user.email} (
            {account.user.email}).
          </p>
          <div className="account-actions">
            <Link className="button secondary" href="/dashboard/links">
              Edit links
            </Link>
            <button
              type="button"
              className="button secondary"
              aria-busy={busy === "sign-out" || undefined}
              aria-disabled={busy !== null || undefined}
              onClick={() => void signOut()}
            >
              {busy === "sign-out" ? "Signing out…" : "Sign out of Devlinks"}
            </button>
          </div>
          <PublishingForm
            key={account.profile.publicId ?? "none"}
            account={account}
          />
        </>
      )}
    </section>
  )
}

function PublishingForm({ account }: { account: SignedIn }) {
  const editor = useEditor()
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState("")
  const heading = useRef<HTMLHeadingElement>(null)
  const { profile } = account
  const form = useForm({
    defaultValues: profile.document ? profile.publishing : defaultPublishing
  })
  async function save() {
    if (saving) {
      setNotice("Still saving. Try again when it finishes.")
      return
    }
    setSaving(true)
    setNotice("")
    const values: Publishing = form.state.values
    const result = await saveAccountPublishing(
      values,
      account.profile.publishingRevision
    )
    setSaving(false)
    if (result.kind !== "saved") {
      setNotice(result.message)
      return
    }
    editor.setAccount(result.view)
    form.reset(result.view.profile.publishing, { keepDefaultValues: true })
    setNotice("Public profile saved.")
  }
  const published = profile.document && profile.publishing.published
  const url =
    profile.publicId && typeof window !== "undefined"
      ? `${window.location.origin}/p/${profile.publicId}`
      : null
  return (
    <section className="publishing" aria-labelledby="publishing-title">
      <h2 id="publishing-title" ref={heading}>
        Public profile
      </h2>
      <p className="muted">
        Your public page shows only what you choose here, from your saved
        profile. Unsaved edits are never shown.
        {!profile.document &&
          " Save your links or profile first, then choose what to publish."}
      </p>
      <form
        noValidate
        onSubmit={event => {
          event.preventDefault()
          void save()
        }}
      >
        <form.Field name="published">
          {field => (
            <label className="check">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={event => field.handleChange(event.target.checked)}
              />
              Publish my profile page
            </label>
          )}
        </form.Field>
        <fieldset className="choices">
          <legend>On the page</legend>
          {choices.map(choice => (
            <form.Field key={choice.name} name={choice.name}>
              {field => (
                <label className="check">
                  <input
                    type="checkbox"
                    checked={field.state.value}
                    onChange={event =>
                      field.handleChange(event.target.checked)
                    }
                  />
                  {choice.label}
                </label>
              )}
            </form.Field>
          ))}
        </fieldset>
        <div className="save-actions">
          <p className="muted public-state">
            {published ? "Your page is public." : "Your page is not public."}
          </p>
          <button
            type="submit"
            className="button"
            aria-busy={saving || undefined}
            aria-disabled={saving || undefined}
          >
            {saving ? "Saving…" : "Save public profile"}
          </button>
        </div>
      </form>
      <p className="status" role="status" aria-live="polite">
        {notice}
      </p>
      {published && url && (
        <p className="public-link">
          <Link href={`/p/${profile.publicId}`}>Open your public profile</Link>
          <span className="muted"> {url}</span>
        </p>
      )}
    </section>
  )
}
