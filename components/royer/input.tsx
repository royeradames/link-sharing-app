import type { ComponentProps } from "react";
import { cn } from "./cn";
import "./foundation.css";
// Adapted from Raul Gym's shadcn/ui input, with a 44px touch target.
export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "rui-control rui-field min-h-11 w-full min-w-0 rounded-[var(--rui-radius)] border border-[var(--rui-control-line)] px-3 py-2 text-base text-[var(--rui-ink)] placeholder:text-[var(--rui-muted)] disabled:opacity-50 aria-invalid:border-[var(--rui-danger)]",
        className,
      )}
      {...props}
    />
  );
}
