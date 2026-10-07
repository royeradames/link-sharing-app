import Link from "next/link"
export default function Page() {
  return (
    <section className="panel welcome">
      <p className="eyebrow">Browser-local preparation</p>
      <h1>Your links, ready to copy</h1>
      <p>
        Build a small profile and an ordered list of links. Save a draft on this
        device, then copy the saved URLs when you need them.
      </p>
      <Link className="button" href="/dashboard/links">
        Open local editor
      </Link>
      <p className="muted">
        This is an intermediate editor. There are no accounts, cloud backups or
        public profile pages yet. Do not use it as your only copy of important
        information.
      </p>
    </section>
  )
}
