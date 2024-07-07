"use client"
import Nav from "@/app/ui/components/Nav"
import { Logo } from "@/app/ui/components/Logo"
import dynamic from "next/dynamic"
import Link from "next/link"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
export function Header() {
  return (
    <header className="flex justify-between items-center self-stretch bg-white pl-6 pr-4 py-4 rounded-xl mb-4 md:mb-6">
      <Logo />
      <Nav></Nav>
      <Link
        href="/preview"
        className="rounded-lg font-semibold text-base border-purple text-purple active:bg-light-purple disabled:opacity-25 bg-white border border-solid px-4 py-[11px] md:px-[27px]"
      >
        <SlIcon name="eye" className="h-5 w-5 sm:hidden" />
        <span className="hidden sm:inline">Preview</span>
      </Link>
    </header>
  )
}
