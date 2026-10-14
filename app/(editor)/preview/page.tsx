import { openGraphFor } from "@/lib/site"
import { SavedPreview } from "@/components/saved-preview"
export const metadata = {
  title: "Saved preview",
  openGraph: openGraphFor("/preview"),
  // This route shows the visitor's own browser-saved data, so it stays out of search.
  robots: { index: false, follow: false },
}
export default function Page() {
  return <SavedPreview />
}
