"use client"
import dynamic from "next/dynamic"
import React from "react"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(sl => sl.SlIcon),
  {
    ssr: false,
  }
)
export default function IconDemo() {
  function handleLoad() {
    console.log("loaded")
  }
  function handleError() {
    console.log("error loading")
  }
  return (
    <>
      <h1>Icon Demo</h1>
      <SlIcon
        name="alarm"
        className="bg-red"
        sl-load={handleLoad}
        sl-error={handleError}
      />
    </>
  )
}
