"use client"

import Link from "next/link"
import { Button } from "@/app/ui/inputs/Button"
import { PreviewElements } from "@/app/ui/components/PreviewElements"

export default function Page() {
  return (
    <article
      aria-label="Preview Page"
      className="flex flex-col flex-wrap gap-[60px] justify-stretch pb-4"
    >
      <header className="flex flex-col items-start gap-2 self-stretch bg-white pl-6 pr-4 py-4 rounded-xl ">
        <nav className="flex items-center gap-4 self-stretch justify-center">
          <Link
            href="/profile-details"
            className="flex flex-col justify-center items-center gap-2 flex-[1_0_0] border border-purple px-[27px] py-[11px] rounded-lg border-solid text-purple text-base font-semibold leading-[150%] max-w-max"
          >
            Back to editor
          </Link>
          <Button className="w-[155px]">Share Link</Button>
        </nav>
      </header>
      <section
        aria-label="Preview elements"
        className="flex-col items-center justify-center gap-14 flex bg-white"
      >
        <PreviewElements />
      </section>
    </article>
  )
}
