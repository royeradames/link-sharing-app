"use client"
import { platforms } from "@/lib/draft"
import { Combobox } from "./royer/combobox"
const options = platforms.map(platform => ({
  value: platform.id,
  label: platform.name
}))
export function PlatformPicker({
  id,
  value,
  onChange,
  error,
  blocked
}: {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
  blocked?: boolean
}) {
  return (
    <div className="platform-field">
      <Combobox
        id={`platform-${id}`}
        label="Platform"
        placeholder="Choose platform"
        options={options}
        value={value}
        onValueChange={onChange}
        blocked={blocked}
        invalid={!!error}
        describedBy={error ? `platform-error-${id}` : undefined}
      />
      {error && (
        <p className="error" id={`platform-error-${id}`}>
          {error}
        </p>
      )}
    </div>
  )
}
