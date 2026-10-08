"use client"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { readProfileImage } from "@/lib/profile-image"
import { useEditor } from "./editor-provider"
import { ProfileCard } from "./profile-card"
export function ProfileEditor() {
  const editor = useEditor()
  const { form, setImageReading } = editor
  const imageSequence = useRef(0)
  const [imageError, setImageError] = useState("")
  // Busy, not disabled: pending work keeps these buttons focusable and
  // announced; the provider blocks the action until the work finishes.
  const busy = editor.saving || editor.imageReading
  useEffect(
    () => () => {
      imageSequence.current += 1
      setImageReading(false)
    },
    [setImageReading]
  )
  async function choose(file: File | undefined) {
    if (!file) return
    const sequence = ++imageSequence.current
    setImageError("")
    setImageReading(true)
    try {
      const image = await readProfileImage(file)
      if (sequence === imageSequence.current)
        form.setFieldValue("profile.image", image)
    } catch (error) {
      if (sequence === imageSequence.current)
        setImageError(
          error instanceof Error
            ? error.message
            : "This image could not be read."
        )
    } finally {
      if (sequence === imageSequence.current) setImageReading(false)
    }
  }
  return (
    <div className="editor-layout">
      <aside className="preview-aside">
        <p className="eyebrow">Saved preview</p>
        <ProfileCard draft={editor.saved} />
      </aside>
      <section className="panel">
        <h1>Profile details</h1>
        <p className="muted">
          Add a name, optional email and picture to your local profile.
        </p>
        <form
          onSubmit={event => {
            event.preventDefault()
            void editor.save("profile")
          }}
          noValidate
        >
          <form.Subscribe selector={state => state.values.profile}>
            {profile => (
              <>
                <p className="save-state">
                  {JSON.stringify(profile) ===
                  JSON.stringify(editor.saved.profile)
                    ? "No unsaved profile changes"
                    : "Unsaved profile changes"}
                </p>
                <div className="image-field">
                  {profile.image && (
                    <Image
                      src={profile.image}
                      unoptimized
                      width={96}
                      height={96}
                      className="avatar"
                      alt="Selected profile picture"
                    />
                  )}
                  <div>
                    <label htmlFor="profile-image">Profile picture</label>
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={event => {
                        void choose(event.target.files?.[0])
                        event.target.value = ""
                      }}
                      aria-describedby="image-limits image-error"
                    />
                    <p id="image-limits" className="muted">
                      PNG or JPEG, up to 256 KB and 1024 × 1024 pixels. Your
                      image stays in this browser.
                    </p>
                    {profile.image && (
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => {
                          imageSequence.current += 1
                          setImageReading(false)
                          form.setFieldValue("profile.image", "")
                        }}
                      >
                        Remove image
                      </button>
                    )}
                    <p id="image-error" className="error" role="status">
                      {imageError}
                    </p>
                    {editor.imageReading && (
                      <p role="status">Checking image…</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </form.Subscribe>
          <div className="profile-fields">
            {(
              [
                { name: "firstName", label: "First name", required: true },
                { name: "lastName", label: "Last name", required: true },
                { name: "email", label: "Email", required: false },
              ] as const
            ).map(item => (
              <form.Field key={item.name} name={`profile.${item.name}`}>
                {field => (
                  <div className="field">
                    <label htmlFor={item.name}>
                      {item.label}
                      {item.required ? " (required)" : " (optional)"}
                    </label>
                    <input
                      id={item.name}
                      value={field.state.value}
                      type={item.name === "email" ? "email" : "text"}
                      maxLength={item.name === "email" ? 254 : 80}
                      autoComplete={
                        item.name === "email"
                          ? "email"
                          : item.name === "firstName"
                            ? "given-name"
                            : "family-name"
                      }
                      onChange={event => field.handleChange(event.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!editor.errors[`profile.${item.name}`]}
                      aria-describedby={
                        editor.errors[`profile.${item.name}`]
                          ? `error-${item.name}`
                          : undefined
                      }
                    />
                    {editor.errors[`profile.${item.name}`] && (
                      <p className="error" id={`error-${item.name}`}>
                        {editor.errors[`profile.${item.name}`]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            ))}
          </div>
          <div className="save-actions">
            <button
              type="button"
              className="text-button"
              aria-disabled={busy || undefined}
              onClick={() => void editor.reloadSaved()}
            >
              {editor.source === "account"
                ? "Load saved profile"
                : "Load saved draft"}
            </button>
            <button
              className="button"
              type="submit"
              disabled={editor.loaded.kind !== "ready"}
              aria-disabled={busy || undefined}
              aria-busy={busy || undefined}
            >
              {editor.saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
