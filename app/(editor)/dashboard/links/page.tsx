import { openGraphFor } from "@/lib/site"
import { LinksEditor } from "@/components/links-editor"
export const metadata = {
  title: "Edit links",
  openGraph: openGraphFor("/dashboard/links"),
}
export default function Page() {
  return <LinksEditor />
}
