import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { SaveButton } from "@/components/save/save-button";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { IconTile } from "@/components/surface/icon-tile";
import { kindLabel, listingHref } from "@/lib/links";
import { facetOptionLabel } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";
import { cn, compactNumber, formatBytes, pluralize } from "@/lib/utils";

/**
 * The theme's card, verbatim.
 *
 * `bg-muted/50` body with a hairline that firms up to `foreground/20` on
 * hover, `rounded-sm`, a serif title, and a `bg-background` well above it for
 * the visual. That inversion — muted card, background well — is the theme's,
 * and it is what stops a grid reading as a stack of floating slabs.
 *
 * The well holds a live render where there is one to hold. A listing with
 * nothing to show doesn't get an empty box: it gets no well at all.
 */
export function ListingCard({
  listing,
  preview,
  className,
}: {
  listing: Listing;
  /** a live render of one of this listing's components, when we have one */
  preview?: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border border-border bg-muted/50",
        "transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-lg",
        className
      )}
    >
      {preview ? (
        <div className="relative flex h-44 items-center justify-center overflow-hidden border-b border-border bg-background">
          {preview}
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-3">
          <IconTile monogram={listing.monogram} color={listing.color} />
          <div className="min-w-0 flex-1">
            <h3 className="flex items-center gap-1.5 font-serif text-[17px] font-medium leading-snug text-foreground">
              <Link
                href={listingHref(listing)}
                className="min-w-0 truncate after:absolute after:inset-0"
              >
                {listing.name}
              </Link>
              {listing.verified ? (
                <Icon
                  name="check"
                  className="size-3.5 shrink-0 text-accent"
                  aria-label="Verified by its maintainers"
                />
              ) : null}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {listing.tagline}
            </p>
          </div>
          <span className="relative z-10 shrink-0">
            <span className="group-hover:hidden">
              <ShipScoreChip listing={listing} />
            </span>
            <span className="hidden group-hover:inline-flex">
              <SaveButton
                target={{ type: "listing", slug: listing.slug }}
                size="icon-sm"
                className="border-transparent"
              />
            </span>
          </span>
        </div>

        <p className="mt-4 truncate border-t border-foreground/10 pt-3 font-mono text-xs tabular-nums text-foreground/50">
          {metaLine(listing).join("  ·  ")}
        </p>
      </div>
    </article>
  );
}

/** The handful of figures worth a line of monospace, in a fixed order. */
function metaLine(listing: Listing): string[] {
  const out: string[] = [];
  const { weeklyDownloads, bundleBytes, githubStars } = listing.facts;

  if (weeklyDownloads) out.push(`${compactNumber(weeklyDownloads)}/wk`);
  else if (githubStars) out.push(`${compactNumber(githubStars)}★`);

  if (bundleBytes) out.push(formatBytes(bundleBytes));

  if (listing.licenseBucket === "mit" || listing.licenseBucket === "apache-2.0") {
    out.push(listing.license);
  } else if (listing.stack.styling[0]) {
    out.push(facetOptionLabel("styling", listing.stack.styling[0]));
  }

  out.push(
    listing.componentCount > 0
      ? pluralize(listing.componentCount, "component")
      : kindLabel(listing.kind)
  );

  return out.slice(0, 4);
}

export function ListingCardSkeleton(): ReactNode {
  return (
    <div className="rounded-sm border border-border bg-muted/50 p-5">
      <div className="flex items-start gap-3">
        <div className="size-10 shrink-0 animate-pulse rounded-sm bg-foreground/10" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-4 w-2/3 animate-pulse rounded-xs bg-foreground/10" />
          <div className="h-3 w-full animate-pulse rounded-xs bg-foreground/10" />
        </div>
      </div>
      <div className="mt-4 h-3 w-1/2 animate-pulse rounded-xs bg-foreground/10" />
    </div>
  );
}
