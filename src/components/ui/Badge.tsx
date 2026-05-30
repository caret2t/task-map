import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        {
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200": variant === "default",
          "bg-[var(--surface-2)] text-[var(--muted)]": variant === "secondary",
          "border border-[var(--border)] text-[var(--foreground)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}
