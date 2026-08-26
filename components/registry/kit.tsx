"use client";

import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The sandbox's own primitives.
 *
 * Everything here is painted with `--pv-*` tokens, never Vitrine's, so Theme
 * Morph repaints previews without touching the surrounding app. The shapes
 * follow shadcn/ui closely because that is the vocabulary most of the
 * catalogue is written in — a viewer pasting their own globals.css should
 * recognise what comes back.
 */

export function PvButton({
  className,
  variant = "default",
  size = "default",
  ...props
}: ComponentProps<"button"> & {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "sm" | "default" | "lg" | "icon";
}): ReactNode {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pv-sm text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        {
          default: "bg-pv-primary text-pv-primary-foreground hover:opacity-90",
          secondary: "bg-pv-secondary text-pv-secondary-foreground hover:opacity-80",
          outline:
            "border border-pv-border bg-pv-background text-pv-foreground hover:bg-pv-muted",
          ghost: "text-pv-foreground hover:bg-pv-muted",
          link: "text-pv-primary underline-offset-4 hover:underline",
          destructive:
            "bg-pv-destructive text-pv-destructive-foreground hover:opacity-90",
        }[variant],
        {
          sm: "h-8 px-3 text-[13px]",
          default: "h-9 px-4",
          lg: "h-10 px-6",
          icon: "size-9",
        }[size],
        className
      )}
      {...props}
    />
  );
}

export function PvCard({ className, ...props }: ComponentProps<"div">): ReactNode {
  return (
    <div
      className={cn(
        "rounded-pv border border-pv-border bg-pv-card text-pv-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function PvInput({ className, ...props }: ComponentProps<"input">): ReactNode {
  return (
    <input
      className={cn(
        "flex h-9 w-full rounded-pv-sm border border-pv-input bg-pv-background px-3 py-1 text-sm text-pv-foreground transition-colors",
        "placeholder:text-pv-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pv-ring/40",
        className
      )}
      {...props}
    />
  );
}

export function PvLabel({ className, ...props }: ComponentProps<"label">): ReactNode {
  return (
    <label
      className={cn("text-sm font-medium leading-none text-pv-foreground", className)}
      {...props}
    />
  );
}

export function PvMuted({ className, ...props }: ComponentProps<"p">): ReactNode {
  return (
    <p className={cn("text-[13px] text-pv-muted-foreground", className)} {...props} />
  );
}

export function PvBadge({
  className,
  variant = "default",
  ...props
}: ComponentProps<"span"> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
}): ReactNode {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        {
          default: "border-transparent bg-pv-primary text-pv-primary-foreground",
          secondary: "border-transparent bg-pv-secondary text-pv-secondary-foreground",
          outline: "border-pv-border text-pv-foreground",
          destructive:
            "border-transparent bg-pv-destructive text-pv-destructive-foreground",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export function PvPanel({ className, ...props }: ComponentProps<"div">): ReactNode {
  return (
    <div
      className={cn(
        "rounded-pv border border-pv-border bg-pv-popover p-1 text-pv-popover-foreground shadow-lg",
        className
      )}
      {...props}
    />
  );
}

/** Layout helper so every preview lands in the same optical centre. */
export function PvStage({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <div className={cn("flex w-full items-center justify-center", className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- prop access */

export function str(props: Record<string, unknown>, key: string, fallback: string): string {
  const value = props[key];
  return typeof value === "string" && value.length ? value : fallback;
}

export function bool(props: Record<string, unknown>, key: string, fallback: boolean): boolean {
  const value = props[key];
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

export function num(props: Record<string, unknown>, key: string, fallback: number): number {
  const value = props[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}
