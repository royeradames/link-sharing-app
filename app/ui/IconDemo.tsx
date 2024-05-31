"use client"
import React from "react"

// @ts-ignore
import { SlIcon } from "@shoelace-style/shoelace/cdn/react"
// import { SlIcon } from "@/node_modules/@shoelace-style/shoelace/cdn/react"
// import { SlIcon } from "@/node_modules/shoelace-style/shoelace/cdn/react"

// https://shoelace.style/getting-started/installation/#setting-the-base-path
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
