import React from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  clean?: boolean;
}

export function Container({
  className,
  children,
  clean = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "w-full max-w-[1200px] mx-auto",
        !clean && "px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
