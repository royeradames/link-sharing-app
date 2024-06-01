import { ReactNode } from "react"
import { Button as RadixButton } from "@radix-ui/themes"
import styles from "./button.module.css"
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
export function ButtonRadix({
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

/*
.button--large {
    height: auto;
    min-height: var(--sl-input-height-large);
    font-size: var(--sl-button-font-size-large);
    line-height: calc(var(--sl-input-height-large) - var(--sl-input-border-width) * 2);
    border-radius: var(--sl-input-border-radius-large);
}

.button {
    display: inline-flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    border-style: solid;
    border-width: var(--sl-input-border-width);
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-font-weight-semibold);
    text-decoration: none;
    user-select: none;
    -webkit-user-select: none;
    white-space: nowrap;
    vertical-align: middle;
    padding: 0;
    transition: var(--sl-transition-x-fast) background-color,
      var(--sl-transition-x-fast) color,
      var(--sl-transition-x-fast) border,
      var(--sl-transition-x-fast) box-shadow;
    cursor: inherit;
}

[--sl-input-font-family:'__Instrument_Sans_8f8cb2','__Instrument_Sans_Fallback_8f8cb2']
[&::part(base)]:[${instrumentSans.style}]
[&::part(base)]:font-instrument-sans
 */
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
