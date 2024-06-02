"use client"
import { Button } from "@/app/ui/components/Button"
import Nav from "@/app/ui/components/Nav"
import { Logo } from "@/app/ui/components/Logo"
import dynamic from "next/dynamic"
import Image from "next/image"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
export function Header() {
  return (
    <header className="flex justify-between items-center self-stretch bg-white pl-6 pr-4 py-4 rounded-xl">
      <Logo />
      <Nav></Nav>
      <Button variant="secondary">
        <div className="flex">
          <Image
            src="assets/icons/eye.svg"
            alt="Preview"
            height={20}
            width={20}
            className="sm:hidden"
            aria-hidden
          />
          <span className="sr-only sm:not-sr-only">Preview</span>
        </div>
      </Button>
    </header>
  )
}
