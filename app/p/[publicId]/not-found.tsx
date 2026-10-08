import Link from "next/link"
import { PublicPage } from "@/components/public-page"

export default function NotFound() {
  return (
    <PublicPage>
      <section className="panel public-missing">
        <h1>This profile isn’t published</h1>
        <p>
          The address may be mistyped, or its owner has not published a profile
          page.
        </p>
        <Link className="button" href="/">
          Go to Devlinks
        </Link>
      </section>
    </PublicPage>
  )
}
