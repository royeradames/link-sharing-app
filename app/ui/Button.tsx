import { ReactNode } from "react"
import { Button as RadixButton } from "@radix-ui/themes"
import styles from "./button.module.css"

export type TButton = {
  children: ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary"
  type?: "submit" | "button" | "reset"
}
export default function Button({
  children,
  disabled,
  type = "button",
  variant = "primary",
}: TButton) {
  return (
    <RadixButton
      variant={variant === "secondary" ? "outline" : "solid"}
      disabled={disabled}
      size="4"
      type={type}
      className={
        variant === "primary" ? styles.radixPrimary : styles.radixSecondary
      }
    >
      {children}
    </RadixButton>
  )
}
