"use client"
import { Button } from "@/app/ui/inputs/Button"
import Nav from "@/app/ui/components/Nav"
import { Logo } from "@/app/ui/components/Logo"
import dynamic from "next/dynamic"

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
        <SlIcon name="eye" className="h-5 w-5 sm:hidden" />
        <span className="hidden sm:inline">Preview</span>
      </Button>
    </header>
  )
}
