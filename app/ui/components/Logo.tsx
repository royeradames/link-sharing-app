import Image from "next/image"
import React from "react"

export function Logo() {
  return (
    <div className="flex gap-2">
      <Image
        src="assets/logo/link-circle-bold.svg"
        alt="link circle"
        height={40}
        width={40}
      />
      <Image
        src="assets/logo/devlinks.svg"
        alt="dev links"
        height={26.25}
        width={135}
      />
    </div>
  )
}
