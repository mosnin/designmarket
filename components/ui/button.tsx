"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The theme's button, not a shadcn button.
 *
 * Every control in the purchased theme is the same shape: a full-round pill,
 * `text-sm font-medium`, 150ms, and a 0.97 press. There are only two weights —
 * solid `bg-foreground text-background`, or a hairline outline that fills with
 * `muted` on hover. Colour is never used to rank a button; the solid one is
 * simply the darker of the two, which is why the whole interface stays quiet.
 */
const buttonVariants = cva(
  "group inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-background hover:bg-foreground/90",
        secondary: "border border-border bg-transparent text-foreground hover:bg-muted",
        outline: "border border-border bg-transparent text-foreground hover:bg-muted",
        ghost: "bg-transparent text-muted-foreground hover:text-foreground",
        danger: "bg-danger text-white hover:brightness-110",
        link: "h-auto bg-transparent p-0 text-foreground underline-offset-4 hover:underline",
      },
      size: {
        xs: "h-7 px-3 text-xs [&_svg]:size-3.5",
        sm: "h-8 px-4 text-[13px] [&_svg]:size-4",
        md: "h-9 px-5 text-sm [&_svg]:size-4",
        lg: "h-11 px-8 text-sm [&_svg]:size-4",
        icon: "size-9 [&_svg]:size-4",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  }
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonProps): ReactNode {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}

export { buttonVariants };
