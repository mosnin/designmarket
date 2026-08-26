import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { IconTile } from "@/components/surface/icon-tile";
import { listingHref } from "@/lib/links";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The dense row: tile, name, one line about it.
 *
 * Most of a catalogue is browsed at this density, not as big cards. Four
 * columns of these show twelve things in the space three cards would take, and
 * the tagline is the only thing that actually helps you decide whether to
 * click.
 */
export function ListingRow({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}): ReactNode {
  return (
    <Link
      href={listingHref(listing)}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface",
        className
      )}
    >
      <IconTile monogram={listing.monogram} color={listing.color} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[15px] font-medium leading-tight">
            {listing.name}
          </span>
          {listing.verified ? (
            <Icon name="check" size={13} className="shrink-0 text-accent" />
          ) : null}
        </span>
        <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">
          {listing.tagline}
        </span>
      </span>
    </Link>
  );
}
