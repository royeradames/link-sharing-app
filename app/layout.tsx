import type { Metadata } from "next"
import localFont from "next/font/local"
import { SITE_NAME, SITE_URL } from "@/lib/site"
import "./globals.css"
const instrument = localFont({
  src: "../public/fonts/InstrumentSans.ttf",
  display: "swap",
  variable: "--font-instrument",
})
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Devlinks local editor", template: "%s | Devlinks" },
  openGraph: { siteName: SITE_NAME, type: "website" },
  description:
    "Prepare and save a profile and up to five links in this browser. This intermediate editor does not publish profiles or provide accounts.",
  robots: { index: false, follow: false },
}
export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={instrument.variable}>
      <body>{children}</body>
    </html>
  )
}
