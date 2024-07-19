import { ReactNode } from "react"
import { clsx } from "clsx"

export type TButton = {
  children: ReactNode
  disabled?: boolean
  variant?: "primary" | "secondary"
  type?: "submit" | "button" | "reset"
  className?: string
  size?: "small" | "medium" | "large"
  loading?: boolean
  onClick?: () => void
}

export function Button({
  children,
  disabled,
  className = "",
  type = "button",
  variant = "primary",
  size = "large",
  loading,
  ...props
}: TButton) {
  return (
    <button
      disabled={disabled}
      type={type}
      onClick={props.onClick}
      className={clsx(
        ` rounded-lg font-semibold text-[1rem] px-[27px] py-[11px]`,
        {
          "border-none bg-purple text-white  active:bg-purple-hover disabled:bg-purple/25":
            variant === "primary",
          "border-purple text-purple active:bg-light-purple disabled:opacity-25 bg-white border":
            variant === "secondary",
          [className]: className,
        }
      )}
    >
      {children}
    </button>
  )
}
