import Link from "next/link"
import { EditorProvider } from "@/components/editor-provider"
import { EditorShell } from "@/components/editor-shell"
import { accountsConfig } from "@/lib/server/accounts"

/** Unknown addresses keep the editor's header and navigation. */
export default function NotFound() {
  return (
    <EditorProvider accounts={accountsConfig()}>
      <EditorShell>
        <section className="panel welcome">
          <h1>Page not found</h1>
          <p>This address does not exist in Devlinks.</p>
          <Link className="button" href="/dashboard/links">
            Open the editor
          </Link>
        </section>
      </EditorShell>
    </EditorProvider>
  )
}
