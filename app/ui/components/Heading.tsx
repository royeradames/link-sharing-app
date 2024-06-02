import React from "react"
import { clsx } from "clsx"

export type THeading = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  children: React.ReactNode
  className?: string
  id?: string
  size?: "medium" | "small"
}
export default function Heading({
  as,
  children,
  className = "",
  id,
  size = "medium",
}: THeading) {
  const Heading = as
  return (
    <Heading
      id={id}
      className={clsx("font-bold leading-[150%] text-dark-grey", {
        "text-[32px]": size === "medium",
        "text-[16px]": size === "small",
        [className]: !!className,
      })}
    >
      {children}
    </Heading>
  )
}
//`npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
