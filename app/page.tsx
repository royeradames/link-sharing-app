"use client"
import React from "react"
import { DemoGroup } from "@/app/demos/DemosGroup"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-8 items-center p-24">
      <DemoGroup />
    </main>
  )
}
