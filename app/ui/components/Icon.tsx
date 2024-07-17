import Image from "next/image"
import React from "react"

const Icon = ({
  name,
  height,
  width,
  alt = "",
}: {
  name: string
  height: number
  width: number
  alt?: string
}) => {
  return (
    <Image
      src={`/assets/icons/${name}.svg`}
      alt={alt}
      width={width}
      height={height}
    />
  )
}

export default Icon
