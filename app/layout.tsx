import "./globals.css"
import "@radix-ui/themes/styles.css"
import type { Metadata } from "next"
import { instrumentSans } from "@/app/ui/fonts"
import { Theme } from "@radix-ui/themes"
import "@shoelace-style/shoelace/dist/themes/light.css"

export const metadata: Metadata = {
  title: {
    template: "%s | Link App",
    default: "Welcome | Link App",
  },
  description:
    "Discover the ultimate Link-sharing App, designed for seamless functionality and user experience. This powerful application allows users to create, read, update, delete, and preview links with ease. Featuring image uploads, repeater fields, drag-and-drop capabilities, and real-time link validation, the Link-sharing App ensures your links are always accurate and up-to-date.\n" +
    "\n" +
    "Enjoy a professional design with mobile, tablet, and desktop layouts, backed by a robust design system for consistent aesthetics. Users can manage profile details, reorder links, and save data securely to a database. Enhance your experience with user authentication for added security. Built with cutting-edge HTML, CSS, and JavaScript technologies, this app offers top-tier performance and reliability. Start using the Link-sharing App today and elevate your link management to the next level.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={instrumentSans.className} style={instrumentSans.style}>
        <h1>Royer</h1>
        <Theme>{children}</Theme>
      </body>
    </html>
  )
}
