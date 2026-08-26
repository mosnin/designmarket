import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: ComponentProps<"div">): ReactNode {
  return (
    <div
      className={cn(
        "shimmer relative overflow-hidden rounded-xs bg-muted",
        className
      )}
      {...props}
    />
  );
}
