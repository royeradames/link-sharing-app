"use client"
import { useState } from "react"
import { PublicPage } from "@/components/public-page"

/** The profile could not be loaded (for example, the database is unreachable). */
export default function ProfileError({ reset }: { reset: () => void }) {
  const [busy, setBusy] = useState(false)
  return (
    <PublicPage>
      <section className="panel public-missing" role="alert">
        <h1>This profile could not be loaded</h1>
        <p>Something went wrong on our side. Try again in a moment.</p>
        <button
          type="button"
          className="button"
          aria-busy={busy || undefined}
          onClick={() => {
            if (busy) return
            setBusy(true)
            reset()
            setBusy(false)
          }}
        >
          Try again
        </button>
      </section>
    </PublicPage>
  )
}
