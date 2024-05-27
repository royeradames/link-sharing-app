import { ReactNode } from "react"
import { Button as RadixButton } from "@radix-ui/themes"
import styles from "./button.module.css"
import { clsx } from "clsx"

export type TButton = {
  children: ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary"
  type?: "submit" | "button" | "reset"
  className?: string
}
export default function Button({
  children,
  disabled,
  className = "",
  type = "button",
  variant = "primary",
}: TButton) {
  return (
    <RadixButton
      variant={variant === "secondary" ? "outline" : "solid"}
      disabled={disabled}
      size="4"
      type={type}
      className={clsx("", {
        [styles.radixPrimary]: variant === "primary",
        [styles.radixSecondary]: variant === "secondary",
        [className]: className,
      })}
    >
      {children}
    </RadixButton>
  )
}
