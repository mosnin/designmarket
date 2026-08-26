import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-medium [&_svg]:size-3",
  {
    variants: {
      // Badges sit inside panels, so none of them carry a fill — a filled pill
      // on a filled card on a filled page is the stack of boxes the reference
      // never has. Colour lives in the text and the hairline instead.
      variant: {
        default: "border-border text-muted-foreground",
        accent: "border-accent/40 text-accent",
        solid: "border-transparent bg-accent text-accent-foreground",
        outline: "border-border text-muted-foreground",
        live: "border-transparent text-muted-foreground",
        success: "border-success/40 text-success",
        warning: "border-warning/40 text-warning",
        danger: "border-danger/40 text-danger",
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

/**
 * "This is really running."
 *
 * It used to be a lime pill stamped on every preview, which said the same
 * thing eight times on one screen and shouted it each time. A preview that is
 * genuinely live demonstrates that by being live; the marker is now a single
 * dot next to a section heading, where it labels a whole group once.
 */
export function LiveBadge({ className }: { className?: string }): ReactNode {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-subtle-foreground",
        className
      )}
    >
      <span className="live-dot size-1.5 shrink-0 rounded-full bg-live" />
      live
    </span>
  );
}

export { badgeVariants };
