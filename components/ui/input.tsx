import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "w-full bg-white border border-[#c0bbb6] text-[#1d1e1c] placeholder:text-[#8e8b87] rounded-[16px] px-5 py-3.5 text-base transition-all duration-200 focus:outline-none focus:border-[#fa5d00] focus:ring-2 focus:ring-[#fa5d00]/20 disabled:bg-[#fff8f1] disabled:cursor-not-allowed",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
