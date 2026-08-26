import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { cn } from "@/lib/utils";

/**
 * A section title with its controls on the right, the way a shelf works in a
 * store: the label tells you what this is, the controls tell you there is more
 * of it than fits.
 */
export function SectionHeading({
  title,
  href,
  linkLabel = "See all",
  aside,
  className,
}: {
  title: ReactNode;
  href?: string;
  linkLabel?: string;
  aside?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div className={cn("mb-5 flex items-end justify-between gap-4", className)}>
      <h2 className="text-[22px] font-semibold leading-none tracking-tight">
        {title}
      </h2>
      <div className="flex shrink-0 items-center gap-2">
        {aside}
        {href ? (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            {linkLabel}
            <Icon
              name="forward"
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
