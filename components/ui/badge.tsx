import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "orange" | "neutral" | "outline";
}

export function Badge({
  className,
  variant = "orange",
  ...props
}: BadgeProps) {
  const variants = {
    orange: "bg-[#fa5d00]/10 text-[#fa5d00] font-semibold",
    neutral: "bg-[#1d1e1c]/5 text-[#615f5c] font-medium",
    outline: "border border-[#c0bbb6] text-[#615f5c] font-medium",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs uppercase tracking-wider transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
