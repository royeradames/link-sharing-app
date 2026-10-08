"use client"
import { useRef, useState } from "react"
import { platforms } from "@/lib/draft"
export function PlatformPicker({
  id,
  index,
  value,
  onChange,
  error
}: {
  id: string
  index: number
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [query, setQuery] = useState("")
  const details = useRef<HTMLDetailsElement>(null)
  const selected = platforms.find(platform => platform.id === value)
  const options = platforms.filter(platform =>
    platform.name.toLowerCase().includes(query.toLowerCase().trim())
  )
  function close() {
    if (details.current) {
      details.current.open = false
      details.current.querySelector("summary")?.focus()
    }
    setQuery("")
  }
  return (
    <div className="platform-field">
      <span id={`label-${id}`}>Platform</span>
      <details
        ref={details}
        className="platform-picker"
        onKeyDown={event => {
          if (event.key === "Escape") {
            event.preventDefault()
            event.stopPropagation()
            close()
          }
        }}
      >
        <summary
          id={`platform-${id}`}
          aria-invalid={!!error}
          aria-describedby={error ? `platform-error-${id}` : undefined}
          aria-label={`Platform for link ${index + 1}: ${selected?.name ?? "Choose platform"}`}
        >
          {selected?.name ?? "Choose platform"}
          <span aria-hidden="true">⌄</span>
        </summary>
        <div className="platform-menu">
          <label htmlFor={`search-${id}`}>Search platforms</label>
          <input
            id={`search-${id}`}
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Enter") event.preventDefault()
            }}
            autoComplete="off"
          />
          <ul aria-label={`Platforms for link ${index + 1}`}>
            {options.map(platform => (
              <li key={platform.id}>
                <button
                  type="button"
                  aria-pressed={value === platform.id}
                  onClick={() => {
                    onChange(platform.id)
                    close()
                  }}
                >
                  {platform.name}
                  {value === platform.id && <span> ✓</span>}
                </button>
              </li>
            ))}
          </ul>
          {!options.length && <p>No matching platforms.</p>}
        </div>
      </details>
      {error && (
        <p className="error" id={`platform-error-${id}`}>
          {error}
        </p>
      )}
    </div>
  )
}
