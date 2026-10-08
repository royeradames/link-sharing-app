import { EditorProvider } from "@/components/editor-provider"
import { EditorShell } from "@/components/editor-shell"
import { accountsConfig } from "@/lib/server/accounts"
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <EditorProvider accounts={accountsConfig()}>
        <EditorShell>{children}</EditorShell>
      </EditorProvider>
      <noscript>
        <p className="storage-warning">
          JavaScript is needed to edit and save a draft in this browser. No
          account or credentials are required.
        </p>
      </noscript>
    </>
  )
}
