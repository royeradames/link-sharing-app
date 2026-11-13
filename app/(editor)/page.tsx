import Link from "next/link"
import { accountsConfig } from "@/lib/server/accounts"
import { websiteJsonLd } from "@/lib/site"
export default function Page() {
  const accounts = accountsConfig()
  return (
    <section className="panel welcome">
      <script
        type="application/ld+json"
        // Static, trusted object; "<" is escaped so the JSON cannot close the tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="eyebrow">Browser-local preparation</p>
      <h1>Your links, ready to copy</h1>
      <p>
        Build a small profile and an ordered list of links. Save a draft on this
        device, then copy the saved URLs when you need them.
      </p>
      <Link className="button" href="/dashboard/links">
        Open local editor
      </Link>
      {accounts.enabled ? (
        <p className="muted">
          Sign in from Account to save your profile to your Breakthrough
          account and publish a public profile page. Without signing in,
          everything stays in this browser.
        </p>
      ) : (
        <p className="muted">
          This is an intermediate editor. There are no accounts, cloud backups
          or public profile pages yet. Do not use it as your only copy of
          important information.
        </p>
      )}
    </section>
  )
}
