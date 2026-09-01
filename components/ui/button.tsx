import React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      showArrow = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fa5d00] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary:
        "bg-[#fa5d00] text-white hover:bg-[#e05300] shadow-[0px_1px_4px_0px_rgba(0,0,0,0.2)] rounded-[16px] font-semibold active:scale-[0.98]",
      secondary:
        "bg-white text-[#1d1e1c] hover:bg-[#fff8f1] border border-[#c0bbb6] rounded-[16px] shadow-sm active:scale-[0.98]",
      outline:
        "border-2 border-[#fa5d00] text-[#fa5d00] hover:bg-[#fa5d00]/5 rounded-[16px]",
      ghost:
        "text-[#1d1e1c] hover:bg-[#fff8f1] hover:text-[#fa5d00] rounded-[16px]",
      link: "text-[#fa5d00] font-medium p-0 hover:underline inline-flex items-center gap-1 bg-transparent border-0 shadow-none",
    };

    const sizes = {
      sm: "text-sm px-4 py-2 gap-1.5",
      md: "text-base px-6 py-3 gap-2",
      lg: "text-lg px-8 py-4 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          variant !== "link" && sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
