import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "paper" | "cream" | "glow" | "outline";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "paper", children, ...props }, ref) => {
    const variants = {
      paper:
        "bg-white border border-[#d9d9d9]/60 shadow-[0px_1px_4px_0px_rgba(0,0,0,0.08)]",
      cream: "bg-[#fff8f1] border border-[#e3d6c5]/50",
      glow: "bg-white shadow-[6px_4px_24px_0px_rgba(250,166,0,0.25)] border border-[#fee3b5]",
      outline: "bg-transparent border border-[#c0bbb6]",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[20px] p-5 sm:p-6 transition-all duration-300",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-2 mb-4", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-xl md:text-2xl font-semibold text-[#1d1e1c] tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-base text-[#615f5c] leading-relaxed", className)}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-6 flex items-center pt-4", className)} {...props} />
  );
}
