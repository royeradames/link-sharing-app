"use client"

import { useRouter } from "next/router"
import { useEffect } from "react"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to /dashboard/links when the component mounts
    router.push("/dashboard/links")
  }, [router])

  return null // or a loading spinner if you want to show something while redirecting
}
