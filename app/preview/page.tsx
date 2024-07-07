"use client"

import Link from "next/link"
import { Button } from "@/app/ui/inputs/Button"
import { PreviewElements } from "@/app/ui/components/PreviewElements"

export default function Page() {
  return (
    <article
      aria-label="Profile Details"
      className="flex flex-col flex-wrap gap-6 "
    >
      <header className="flex flex-col items-start gap-2 self-stretch bg-white pl-6 pr-4 py-4 rounded-xl">
        <nav className="flex items-center gap-4 self-stretch">
          <Link
            href="/links"
            className="flex flex-col justify-center items-center gap-2 flex-[1_0_0] border border-purple px-[27px] py-[11px] rounded-lg border-solid text-purple text-base font-semibold leading-[150%]"
          >
            Back to editor
          </Link>
          <Button>Share Link</Button>
        </nav>
      </header>
      <div className="flex w-[375px] flex-col items-center gap-[60px] [background:var(--White,#FFF)] pb-[237px]">
        <PreviewElements />
      </div>
    </article>
  )
}
