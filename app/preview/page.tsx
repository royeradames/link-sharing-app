"use client"

import Link from "next/link"
import { Button } from "@/app/ui/inputs/Button"
import { PreviewElements } from "@/app/ui/components/PreviewElements"

export default function Page() {
  return (
    <article
      aria-label="Preview Page"
      className="flex flex-col flex-wrap gap-[60px] justify-stretch pb-4 md:bg-light-grey md:items-center"
    >
      <header className="flex flex-col items-start gap-2 self-stretch bg-white pl-6 pr-4 py-4 md:h-[357px] md:bg-purple md:rounded-b-3xl">
        <nav className="flex items-center gap-4 self-stretch justify-center md:bg-white md:rounded-xl md:justify-between md:pl-6 md:pr-4 md:py-4 ">
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
        className="flex-col items-center justify-center gap-14 flex bg-white md:px-14 md:py-12 md:rounded-3xl shadow-[0px_0px_32px_0px_rgba(0,0,0,0.10)] md:w-[349px]  md:items-stretch md:absolute top-44"
      >
        <PreviewElements />
      </section>
    </article>
  )
}
