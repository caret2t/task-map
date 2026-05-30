import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "ghost" | "outline" | "destructive" | "link";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-blue-500 text-white hover:bg-blue-600": variant === "default",
            "hover:bg-[var(--surface)] hover:text-[var(--foreground)]": variant === "ghost",
            "border border-[var(--border)] bg-transparent hover:bg-[var(--surface)]": variant === "outline",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
            "underline-offset-4 hover:underline text-blue-500": variant === "link",
          },
          {
            "h-7 px-2 text-xs": size === "sm",
            "h-9 px-3 text-sm": size === "md",
            "h-11 px-4 text-base": size === "lg",
            "h-8 w-8": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
