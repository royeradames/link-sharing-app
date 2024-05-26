import { ReactNode } from "react"
import { Button as RadixButton } from "@radix-ui/themes"
import styles from "./button.module.css"

export type TButton = {
  children: ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary"
}
export default function Button({
  children,
  disabled,
  variant = "primary",
}: TButton) {
  return (
    <RadixButton
      variant={variant === "secondary" ? "outline" : "solid"}
      disabled={disabled}
      size="4"
      className={
        variant === "primary" ? styles.radixPrimary : styles.radixSecondary
      }
    >
      {children}
    </RadixButton>
  )
}
