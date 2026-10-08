import { openGraphFor } from "@/lib/site"
import { SavedPreview } from "@/components/saved-preview"
export const metadata = {
  title: "Saved preview",
  openGraph: openGraphFor("/preview"),
}
export default function Page() {
  return <SavedPreview />
}
