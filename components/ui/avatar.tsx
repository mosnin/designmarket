"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Root>): ReactNode {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "border-border bg-muted relative flex size-8 shrink-0 overflow-hidden rounded-full border",
        className
      )}
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Image>): ReactNode {
  return (
    <AvatarPrimitive.Image
      // Rounded here rather than left to the root's `overflow-hidden`. In
      // Tailwind v4 `rounded-full` is `calc(infinity * 1px)`, and Chromium
      // clips an overflowing child against that radius as a squircle rather
      // than a circle — so a member with a profile photo got a rounded square
      // while everyone else got a circle.
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className
      )}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: ComponentProps<typeof AvatarPrimitive.Fallback>): ReactNode {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "bg-foreground/10 text-foreground flex size-full items-center justify-center text-[11px] font-semibold uppercase",
        className
      )}
      {...props}
    />
  );
}
