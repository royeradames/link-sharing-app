import type { Metadata } from "next"
import localFont from "next/font/local"
import { SITE_URL, openGraphFor, websiteJsonLd } from "@/lib/site"
import "./globals.css"
const instrument = localFont({
  src: "../public/fonts/InstrumentSans.ttf",
  display: "swap",
  variable: "--font-instrument",
})
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Devlinks local editor", template: "%s | Devlinks" },
  openGraph: openGraphFor("/"),
  description:
    "Prepare and save a profile and up to five links in this browser. This intermediate editor does not publish profiles or provide accounts.",
  robots: { index: false, follow: false },
}
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={instrument.variable}>
      <body>
        {/* One WebSite identity on every route, matching og:site_name.
            Static, trusted object; "<" is escaped so the JSON cannot close the tag. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  )
}
