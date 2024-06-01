import { ReactNode } from "react"
import { clsx } from "clsx"
import dynamic from "next/dynamic"

const SlButton = dynamic(
  () => import("@shoelace-style/shoelace/dist/react").then(mod => mod.SlButton),
  {
    ssr: false,
  }
)
export type TButton = {
  children: ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary"
  type?: "submit" | "button" | "reset"
  className?: string
  size?: "small" | "medium" | "large"
}

export function Button({
  children,
  disabled,
  className = "",
  type = "button",
  variant = "primary",
  size = "large",
}: TButton) {
  return (
    <SlButton
      variant="primary"
      disabled={disabled}
      outline={variant === "secondary"}
      size={size}
      type={type}
      className={clsx(
        ` [&::part(base)]:rounded-lg [&::part(base)]:font-semibold [&::part(base)]:text-[1rem]`,
        {
          "[&::part(base)]:border-none [&::part(base)]:bg-purple [&::part(base)]:text-white  [&::part(base):active]:bg-purple-hover [&[disabled]::part(base)]:bg-purple/25":
            variant === "primary",
          "[&::part(base)]:border-purple [&::part(base)]:text-purple [&::part(base):active]:bg-light-purple [&[disabled]::part(base)]:opacity-25 [&::part(base)]:bg-white":
            variant === "secondary",
          [className]: className,
        }
      )}
    >
      {children}
    </SlButton>
  )
}