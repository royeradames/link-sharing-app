"use client"
import React, { useEffect } from "react"
import { PreviewListDemo } from "@/app/ui/demos/PreviewListDemo"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /links when the component mounts
    router.push("/dashboard/links")
  }, [router])
  return (
    <main className="flex min-h-screen flex-col gap-8">
      <PreviewListDemo />
    </main>
  )
}
