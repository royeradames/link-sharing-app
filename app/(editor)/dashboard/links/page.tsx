import { openGraphFor } from "@/lib/site"
import { LinksEditor } from "@/components/links-editor"
import { preload } from "react-dom"
export const metadata = {
  title: "Edit links",
  openGraph: openGraphFor("/dashboard/links"),
}
export default function Page() {
  preload("/assets/get-starter-illustration.svg", {
    as: "image",
    fetchPriority: "high",
  })
  return <LinksEditor />
}
