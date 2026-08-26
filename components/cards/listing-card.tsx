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
 * A listing is a row, not a card.
 *
 * It used to open with a tall gradient panel holding a two-letter monogram —
 * decoration occupying the space where a fact should be, which pushed the grid
 * down to three-across and gave every result a box of its own to sit in. The
 * reference does none of that: a small brand mark, a name, a line of grey, and
 * air. No fill, no outline, nothing nested inside anything.
 *
 * The consequence is density. Four across at desktop width, and every pixel
 * spent is spent on something you could act on.
 */
export function ListingCard({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}): ReactNode {
  const meta = metaLine(listing);

  return (
    <article
      className={cn(
        "group relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-surface",
        className
      )}
    >
      <IconTile monogram={listing.monogram} color={listing.color} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="min-w-0 truncate text-[13.5px] font-semibold leading-snug tracking-tight">
            <Link href={listingHref(listing)} className="after:absolute after:inset-0">
              {listing.name}
            </Link>
          </h3>
          {listing.verified ? (
            <Icon
              name="check"
              className="size-3.5 shrink-0 text-accent"
              aria-label="Verified by its maintainers"
            />
          ) : null}
        </div>

        <p className="mt-0.5 truncate text-[12.5px] leading-snug text-muted-foreground">
          {listing.tagline}
        </p>

        <p className="mt-1 truncate font-mono text-[11px] tabular-nums text-subtle-foreground">
          {meta.join("  ·  ")}
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

  // Four across means roughly forty characters of monospace. A fourth fact
  // that arrives as an ellipsis is worse than no fourth fact.
  return out.slice(0, 3);
}

export function ListingCardSkeleton(): ReactNode {
  return (
    <div className="flex items-start gap-3 px-2.5 py-2.5">
      <div className="size-10 shrink-0 animate-pulse rounded-[11px] bg-surface-2" />
      <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
        <div className="h-3 w-2/3 animate-pulse rounded-xs bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded-xs bg-surface-2" />
        <div className="h-2.5 w-1/2 animate-pulse rounded-xs bg-surface-2" />
      </div>
    </div>
  );
}
