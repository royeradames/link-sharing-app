"use client"

import { PreviewElements } from "@/app/ui/components/PreviewElements"

export function LivePreview() {
  return (
    <div className="hidden xl:flex w-[560px] justify-center items-center gap-2 self-stretch bg-white p-6 rounded-xl">
      <section
        aria-label="Live preview"
        className="bg-[url('/assets/preview-section.svg')] w-[307px] h-[631px] shrink-0 bg-no-repeat flex-col items-center justify-center gap-14 flex "
      >
        <h2 className="sr-only">Live preview</h2>
        <PreviewElements />
      </section>
    </div>
  )
}
