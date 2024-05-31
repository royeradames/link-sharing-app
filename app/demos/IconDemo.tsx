"use client"
import { SlIcon } from "@shoelace-style/shoelace/dist/react"

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
