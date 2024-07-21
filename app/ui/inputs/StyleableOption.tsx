import { clsx } from "clsx"
import React, { ReactNode } from "react"

export function StyleableOption({
  value,
  children,
  isSelected,
  isFocused,
  className,
  onClick,
}: {
  value: string
  triggerLabel: string
  className?: string
  children: ReactNode
  isSelected?: boolean
  isFocused?: boolean
  onClick?: () => void
}) {
  return (
    <li
      key={value}
      className={clsx(``, {
        [className || ""]: className,
      })}
      onClick={onClick}
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      data-selected={isSelected ? isSelected : undefined}
      data-focused={isFocused ? isFocused : undefined}
    >
      {children}
    </li>
  )
}
