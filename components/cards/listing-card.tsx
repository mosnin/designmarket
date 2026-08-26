import { Icon } from "@/components/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { CardArt } from "@/components/cards/card-art";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/ui/tooltip";
import { kindLabel, listingHref } from "@/lib/links";
import { facetOptionLabel } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";
import { cn, compactNumber, formatBytes } from "@/lib/utils";

/** The two or three facts that actually decide whether you keep reading. */
function factLine(listing: Listing): { label: string; value: string; hint: string }[] {
  const out: { label: string; value: string; hint: string }[] = [];
  const { weeklyDownloads, bundleBytes, githubStars } = listing.facts;

  if (weeklyDownloads) {
    out.push({
      label: "downloads",
      value: `${compactNumber(weeklyDownloads)}/wk`,
      hint: `${weeklyDownloads.toLocaleString()} npm downloads last week`,
    });
  } else if (githubStars) {
    out.push({
      label: "stars",
      value: `${compactNumber(githubStars)}★`,
      hint: `${githubStars.toLocaleString()} GitHub stars`,
    });
  }

  if (bundleBytes) {
    out.push({
      label: "size",
      value: formatBytes(bundleBytes),
      hint: "Minified and gzipped, from bundlephobia",
    });
  }

  return out;
}

export function ListingCard({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}): ReactNode {
  const facts = factLine(listing);
  const chips = [
    ...listing.stack.styling.slice(0, 1).map((v) => facetOptionLabel("styling", v)),
    listing.stack.rsc === "safe" ? "RSC-safe" : null,
    listing.licenseBucket === "mit" || listing.licenseBucket === "apache-2.0"
      ? listing.license
      : null,
  ].filter((v): v is string => Boolean(v));

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface shadow-card transition-all",
        "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop",
        className
      )}
    >
      <CardArt
        monogram={listing.monogram}
        color={listing.color}
        className="aspect-[16/8] border-b border-border"
      />

      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-snug tracking-tight">
            <Link href={listingHref(listing)} className="after:absolute after:inset-0">
              {listing.name}
            </Link>
          </h3>
          {listing.verified ? (
            <Hint label="Claimed and verified by its maintainers">
              <Icon name="check" className="mt-0.5 size-4 shrink-0 text-accent" />
            </Hint>
          ) : null}
          <ShipScoreChip listing={listing} className="relative z-10 mt-0.5" />
        </div>

        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
          {listing.tagline}
        </p>

        {chips.length ? (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {chips.map((chip) => (
              <Badge key={chip} variant="outline">
                {chip}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex items-center gap-2.5 pt-3 text-[11px] text-subtle-foreground">
          {facts.map((fact) => (
            <span key={fact.label} className="font-mono tabular-nums" title={fact.hint}>
              {fact.value}
            </span>
          ))}
          {listing.componentCount > 0 ? (
            <span className="relative z-10 ml-auto inline-flex items-center gap-1 font-mono text-live">
              <span className="live-dot size-1.5 rounded-full bg-live" />
              {listing.componentCount} live
            </span>
          ) : (
            <span className="ml-auto">{kindLabel(listing.kind)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ListingCardSkeleton(): ReactNode {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      <div className="aspect-[16/8] animate-pulse border-b border-border bg-surface-2" />
      <div className="flex flex-col gap-2 p-3.5">
        <div className="h-4 w-2/3 animate-pulse rounded-xs bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded-xs bg-surface-2" />
        <div className="h-3 w-4/5 animate-pulse rounded-xs bg-surface-2" />
      </div>
    </div>
  );
}
