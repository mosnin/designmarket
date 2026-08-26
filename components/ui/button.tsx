"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground hover:bg-accent-hover shadow-card",
        secondary:
          "bg-surface-2 text-foreground border border-border hover:border-border-strong hover:bg-muted",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-border-strong",
        ghost: "bg-transparent text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        danger: "bg-danger text-white hover:brightness-110",
        link: "bg-transparent text-accent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        xs: "h-7 rounded-xs px-2 text-xs [&_svg]:size-3.5",
        sm: "h-8 rounded-sm px-3 text-[13px] [&_svg]:size-4",
        md: "h-9 rounded-sm px-4 text-sm [&_svg]:size-4",
        lg: "h-11 rounded-md px-6 text-[15px] [&_svg]:size-[18px]",
        icon: "size-9 rounded-sm [&_svg]:size-4",
        "icon-sm": "size-8 rounded-xs [&_svg]:size-4",
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
  asChild = false,
  ...props
}: ButtonProps): ReactNode {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };
