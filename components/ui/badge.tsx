import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium [&_svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-2 text-muted-foreground",
        accent: "border-transparent bg-accent-muted text-accent",
        solid: "border-transparent bg-accent text-accent-foreground",
        outline: "border-border-strong bg-transparent text-muted-foreground",
        live: "border-transparent bg-live/15 text-live",
        success: "border-transparent bg-success/12 text-success",
        warning: "border-transparent bg-warning/12 text-warning",
        danger: "border-transparent bg-danger/12 text-danger",
      },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    defaultVariants: { variant: "default", size: "sm" },
  }
);

export function Badge({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>): ReactNode {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

/** The signature "this is really running" indicator. */
export function LiveBadge({ className }: { className?: string }): ReactNode {
  return (
    <Badge variant="live" className={cn("font-mono uppercase tracking-wide", className)}>
      <span className="live-dot size-1.5 rounded-full bg-live" />
      Live
    </Badge>
  );
}

export { badgeVariants };
