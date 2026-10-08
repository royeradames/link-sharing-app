import Link from "next/link"
import { PublicPage } from "@/components/public-page"
import { accountsConfig } from "@/lib/server/accounts"

export default function NotFound() {
  const { enabled } = accountsConfig()
  return (
    <PublicPage>
      <section className="panel public-missing">
        {enabled ? (
          <>
            <h1>This profile isn’t published</h1>
            <p>
              The address may be mistyped, or its owner has not published a
              profile page.
            </p>
          </>
        ) : (
          <>
            <h1>Public profiles are coming soon</h1>
            <p>
              Devlinks accounts and public profile pages are coming soon. The
              editor already works today and keeps your saves in this browser.
            </p>
          </>
        )}
        <Link className="button" href="/">
          Go to Devlinks
        </Link>
      </section>
    </PublicPage>
  )
}
