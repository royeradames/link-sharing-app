import { clsx } from "clsx"
import { DetailedHTMLProps, HTMLAttributes, LabelHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export type TBody = DetailedHTMLProps<
  HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> &
  DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement> &
  DetailedHTMLProps<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> &
  DetailedHTMLProps<
    HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  > & {
    size?: "medium" | "small"
    as?: "span" | "div" | "label" | "p"
  }
export default function Text({
  children,
  className = "",
  size = "medium",
  as = "span",
  ...props
}: TBody) {
  const Text = as
  return (
    <Text
      className={cn(
        clsx("font-regular leading-[150%]", {
          "text-base": size === "medium",
          "text-xs": size === "small",
          "text-dark-grey text-xs font-normal": as === "label",
          "text-grey text-base font-normal ": as === "p",
          "text-grey": as === "span",
          [className]: className,
        })
      )}
      {...props}
    >
      {children}
    </Text>
  )
}
