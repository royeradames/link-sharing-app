"use client"
import { PublicPage } from "@/components/public-page"

/** The profile could not be loaded (for example, the database is unreachable). */
export default function ProfileError({ reset }: { reset: () => void }) {
  return (
    <PublicPage>
      <section className="panel public-missing" role="alert">
        <h1>This profile could not be loaded</h1>
        <p>Something went wrong on our side. Try again in a moment.</p>
        <button type="button" className="button" onClick={() => reset()}>
          Try again
        </button>
      </section>
    </PublicPage>
  )
}
