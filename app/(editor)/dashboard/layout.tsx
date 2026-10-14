import type { Metadata } from "next"

export const metadata: Metadata = {
  // This route shows the visitor's own browser-saved data, so it stays out of search.
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
