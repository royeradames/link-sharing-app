"use client"
import { useEffect } from "react"
import { router } from "next/client"

export default function Page() {
  useEffect(() => {
    // Redirect to /links when the component mounts
    router.push("/dashboard/links")
  }, [])
  return <></>
}
