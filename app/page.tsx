"use client"
import React from "react"
import { PreviewListDemo } from "@/app/demos/PreviewListDemo"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-8">
      {/*<DemoGroup />*/}
      <PreviewListDemo />
    </main>
  )
}
