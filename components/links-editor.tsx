"use client"
import Image from "next/image"
import { useRef } from "react"
import { moveLink } from "@/lib/draft"
import { useEditor } from "./editor-provider"
import { PlatformPicker } from "./platform-picker"
import { ProfileCard } from "./profile-card"
export function LinksEditor() {
  const editor = useEditor()
  const { form } = editor
  const dragged = useRef<string | null>(null)
  const addButton = useRef<HTMLButtonElement>(null)
  // Busy, not disabled: pending work keeps these buttons focusable and
  // announced; the provider blocks the action until the work finishes.
  const busy = editor.saving || editor.imageReading
  function move(id: string, targetId: string) {
    const next = moveLink(form.state.values.links, id, targetId)
    form.setFieldValue("links", next)
    editor.setNotice(
      `Link moved to position ${next.findIndex(link => link.id === id) + 1}. Save links to keep this order.`
    )
  }
  function focusRow(id: string | undefined) {
    requestAnimationFrame(() =>
      id
        ? document.getElementById(`platform-${id}`)?.focus()
        : addButton.current?.focus()
    )
  }
  return (
    <div className="editor-layout">
      <aside className="preview-aside">
        <p className="eyebrow">Saved preview</p>
        <ProfileCard draft={editor.saved} />
      </aside>
      <section className="panel">
        <h1>Customize your links</h1>
        <p className="muted">
          Add, edit and reorder up to five links. Save them here, then copy your
          saved list.
        </p>
        <form
          onSubmit={event => {
            event.preventDefault()
            void editor.save("links")
          }}
          noValidate
        >
          <form.Subscribe selector={state => state.values.links}>
            {links => (
              <>
                <p className="save-state">
                  <span>
                    {JSON.stringify(links) ===
                    JSON.stringify(editor.saved.links)
                      ? "No unsaved link changes"
                      : "Unsaved link changes"}
                  </span>{" "}
                  <span aria-hidden="true">·</span>{" "}
                  <span>{`${links.length} of 5 links`}</span>
                </p>
                <button
                  type="button"
                  ref={addButton}
                  className="button secondary add-link"
                  disabled={links.length >= 5}
                  aria-disabled={editor.saving || undefined}
                  aria-busy={editor.saving || undefined}
                  onClick={() => {
                    if (editor.saving) return
                    const id = crypto.randomUUID()
                    form.setFieldValue("links", [
                      ...links,
                      { id, platform: "", url: "" }
                    ])
                    focusRow(id)
                  }}
                >
                  + Add new link
                </button>
                {!links.length && (
                  <div className="empty-state">
                    <Image
                      src="/assets/get-starter-illustration.svg"
                      width={250}
                      height={161}
                      alt=""
                    />
                    <h2>Let’s get you started</h2>
                    <p>Add your first platform and its HTTPS link.</p>
                  </div>
                )}
                <ol className="link-rows">
                  {links.map((link, index) => (
                    <li
                      key={link.id}
                      className="link-row"
                      onDragOver={event => {
                        if (dragged.current) event.preventDefault()
                      }}
                      onDrop={event => {
                        event.preventDefault()
                        if (dragged.current) move(dragged.current, link.id)
                        dragged.current = null
                      }}
                    >
                      <div className="row-heading">
                        <h2>Link #{index + 1}</h2>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => {
                            form.setFieldValue(
                              "links",
                              links.filter(item => item.id !== link.id)
                            )
                            focusRow(
                              links[index + 1]?.id ?? links[index - 1]?.id
                            )
                            editor.setNotice(
                              `Link ${index + 1} removed from your edits. Save links to keep the change.`
                            )
                          }}
                        >
                          Remove
                          <span className="sr-only"> link {index + 1}</span>
                        </button>
                      </div>
                      <div className="reorder-controls">
                        <button
                          type="button"
                          draggable
                          aria-label={`Drag link ${index + 1}`}
                          onDragStart={event => {
                            dragged.current = link.id
                            event.dataTransfer.setData("text/plain", link.id)
                            event.dataTransfer.effectAllowed = "move"
                          }}
                          onDragEnd={() => {
                            dragged.current = null
                          }}
                        >
                          ↕ Drag
                        </button>
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => move(link.id, links[index - 1].id)}
                        >
                          Move up
                          <span className="sr-only"> link {index + 1}</span>
                        </button>
                        <button
                          type="button"
                          disabled={index === links.length - 1}
                          onClick={() => move(link.id, links[index + 1].id)}
                        >
                          Move down
                          <span className="sr-only"> link {index + 1}</span>
                        </button>
                      </div>
                      <form.Field name={`links[${index}].platform`}>
                        {field => (
                          <PlatformPicker
                            id={link.id}
                            index={index}
                            value={field.state.value}
                            onChange={field.handleChange}
                            error={editor.errors[`links.${link.id}.platform`]}
                          />
                        )}
                      </form.Field>
                      <form.Field name={`links[${index}].url`}>
                        {field => (
                          <div className="field">
                            <label htmlFor={`url-${link.id}`}>Link URL</label>
                            <input
                              id={`url-${link.id}`}
                              type="url"
                              inputMode="url"
                              autoComplete="off"
                              maxLength={2048}
                              placeholder="https://github.com/your-name"
                              value={field.state.value}
                              onChange={event =>
                                field.handleChange(event.target.value)
                              }
                              onBlur={field.handleBlur}
                              aria-invalid={
                                !!editor.errors[`links.${link.id}.url`]
                              }
                              aria-describedby={
                                editor.errors[`links.${link.id}.url`]
                                  ? `error-${link.id}`
                                  : undefined
                              }
                            />
                            {editor.errors[`links.${link.id}.url`] && (
                              <p id={`error-${link.id}`} className="error">
                                {editor.errors[`links.${link.id}.url`]}
                              </p>
                            )}
                          </div>
                        )}
                      </form.Field>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </form.Subscribe>
          {editor.errors.links && (
            <p className="error">{editor.errors.links}</p>
          )}
          <div className="save-actions">
            <button
              type="button"
              className="text-button"
              aria-disabled={busy || undefined}
              onClick={() => void editor.reloadSaved()}
            >
              Load saved draft
            </button>
            <button
              className="button"
              type="submit"
              disabled={editor.loaded.kind !== "ready"}
              aria-disabled={busy || undefined}
              aria-busy={busy || undefined}
            >
              {editor.saving ? "Saving…" : "Save links"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
