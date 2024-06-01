"use client"
import dynamic from "next/dynamic"

const SlIcon = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlIcon),
  {
    ssr: false,
  }
)
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
