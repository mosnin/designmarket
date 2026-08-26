import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A raised block. In dark mode it separates from the page by being lighter,
 * not by being outlined — an outline on every panel is most of what makes a
 * dark interface look noisy.
 */
export function Panel({ className, ...props }: ComponentProps<"div">): ReactNode {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface dark:border-transparent",
        className
      )}
      {...props}
    />
  );
}
