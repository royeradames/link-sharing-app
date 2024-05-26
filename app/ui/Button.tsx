import { ReactNode } from "react"
import { Button as RadixButton } from "@radix-ui/themes"
import styles from "./button.module.css"

export type TButton = {
  children: ReactNode
  disabled?: boolean
}
export default function Button({ children, disabled }: TButton) {
  return (
    <RadixButton disabled={disabled} size="4" className={styles.radix}>
      {children}
    </RadixButton>
  )
}
