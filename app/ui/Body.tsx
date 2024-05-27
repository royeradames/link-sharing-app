import { ReactNode } from "react"
import { clsx } from "clsx"

export type TBody = {
  children: ReactNode
  className?: string
  id?: string
  size?: "medium" | "small"
}
export default function Body({
  children,
  id,
  className = "",
  size = "medium",
}: TBody) {
  return (
    <p
      className={clsx("font-regular leading-[150%]", {
        "text-base": size === "medium",
        "text-xs": size === "small",
        [className]: className,
      })}
      id={id}
    >
      {children}
    </p>
  )
}
