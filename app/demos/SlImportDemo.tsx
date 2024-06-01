"use client"
import dynamic from "next/dynamic"
import React from "react"

const SlButton = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(sl => sl.SlButton),
  {
    ssr: false,
  }
)
const SlSelect = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(sl => sl.SlSelect),
  {
    ssr: false,
  }
)
export function SlImportDemo() {
  return (
    <>
      <SlButton></SlButton>
      <SlSelect></SlSelect>
    </>
  )
}
