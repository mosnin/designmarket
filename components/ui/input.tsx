import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type, ...props }: ComponentProps<"input">): ReactNode {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-sm border border-border bg-surface px-3 py-1 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-subtle-foreground",
        "hover:border-border-strong",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">): ReactNode {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
        "placeholder:text-subtle-foreground hover:border-border-strong",
        "focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}
