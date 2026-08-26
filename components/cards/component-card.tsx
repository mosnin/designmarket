import Link from "next/link";
import type { ReactNode } from "react";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { componentKindLabel } from "@/lib/taxonomy";
import type { Listing, UIComponent } from "@/lib/types";
import { brandInk, brandWash } from "@/lib/brand-color";
import { listingHref } from "@/lib/links";
import { cn } from "@/lib/utils";

/**
 * The component-level card.
 *
 * The preview area is a slot rather than an image: the render layer injects a
 * real, running instance there. Until a component has been vendored into the
 * preview sandbox the card says so plainly instead of showing a placeholder
 * dressed up as a screenshot.
 */
export function ComponentCard({
  component,
  listing,
  preview,
  className,
}: {
  component: UIComponent;
  listing?: Listing | undefined;
  preview?: ReactNode;
  className?: string;
}): ReactNode {
  const renderable = component.previewMode !== "static";

  return (
    <article
      className={cn(
        "t-lift group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-card dark:border-transparent",
        "hover:border-border-strong hover:shadow-pop",
        className
      )}
    >
      <div
        className={cn(
          "relative flex aspect-[16/10] items-center justify-center overflow-hidden border-b border-border",
          component.gridBackdrop ? "bg-grid" : "bg-surface-2"
        )}
      >
        {preview ?? (
          <div className="flex flex-col items-center gap-1.5 px-4 text-center">
            <span
              className="font-mono text-xs uppercase tracking-widest"
              style={{
              color: listing ? brandInk(listing.color) : "var(--subtle-foreground)",
            }}
            >
              {componentKindLabel(component.kind)}
            </span>
            <span className="text-[11px] text-subtle-foreground">
              {renderable ? "Preview loads on the detail page" : "Not vendored yet — links out"}
            </span>
          </div>
        )}

        <div className="absolute left-2 top-2">
          {renderable ? (
            <LiveBadge />
          ) : (
            <Badge variant="outline" className="bg-surface/80 backdrop-blur">
              Links out
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-baseline gap-2">
          <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-tight">
            <Link
              href={`/components/${component.slug}`}
              className="after:absolute after:inset-0"
            >
              {component.name}
            </Link>
          </h3>
          <span className="shrink-0 font-mono text-[11px] text-subtle-foreground">
            {componentKindLabel(component.kind)}
          </span>
        </div>

        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {component.description}
        </p>

        <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-subtle-foreground">
          <span
            className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] font-mono text-[8px] font-semibold"
            style={{
              backgroundColor: brandWash(listing?.color ?? "var(--accent)", 20),
              color: brandInk(listing?.color ?? "var(--accent)"),
            }}
          >
            {listing?.monogram ?? "??"}
          </span>
          <Link
            href={listing ? listingHref(listing) : `/l/${component.listingSlug}`}
            className="relative z-10 truncate hover:text-foreground hover:underline"
          >
            {listing?.name ?? component.listingSlug}
          </Link>
          {component.a11yNotes ? (
            <span
              className="ml-auto shrink-0 rounded-full bg-success/12 px-1.5 py-0.5 font-medium text-success"
              title={component.a11yNotes}
            >
              a11y
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
