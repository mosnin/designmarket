import { CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { ComponentCard } from "@/components/cards/component-card";
import { ListingCard } from "@/components/cards/listing-card";
import { Badge } from "@/components/ui/badge";
import { getComponent, getDrop, getListing, getRecentDrops } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = pageMetadata({
  title: "The Drop",
  description: "One curated set a day. Things worth the ten minutes.",
  path: "/drop",
});

export default async function DropPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}): Promise<ReactNode> {
  const { date } = await searchParams;
  const [drop, recent] = await Promise.all([getDrop(date), getRecentDrops(10)]);

  if (!drop) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">The Drop</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nothing scheduled for that day.
        </p>
      </div>
    );
  }

  const [listings, components] = await Promise.all([
    Promise.all(drop.listingSlugs.map((slug) => getListing(slug))),
    Promise.all(drop.componentSlugs.map((slug) => getComponent(slug))),
  ]);

  const resolvedListings = listings.filter((l) => l !== null);
  const resolvedComponents = components.filter((c) => c !== null);

  // Components in a drop rarely come from the listings in the same drop, so
  // their parents are resolved separately.
  const parents = await Promise.all(
    [...new Set(resolvedComponents.map((c) => c.listingSlug))].map((slug) =>
      getListing(slug)
    )
  );
  const listingBySlug = new Map(
    parents.filter((l) => l !== null).map((l) => [l.slug, l])
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="border-b border-border pb-6">
        <div className="flex items-center gap-2">
          <Badge variant="accent">
            <CalendarDays className="size-3" />
            {formatDate(Date.parse(drop.date))}
          </Badge>
        </div>
        <h1 className="mt-3 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
          {drop.headline}
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {drop.note}
        </p>
      </header>

      {resolvedComponents.length ? (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-subtle-foreground">
            Components
          </h2>
          <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {resolvedComponents.map((component) => (
              <ComponentCard
                key={component.slug}
                component={component}
                listing={listingBySlug.get(component.listingSlug)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {resolvedListings.length ? (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-subtle-foreground">
            Listings
          </h2>
          <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {resolvedListings.map((listing) => (
              <ListingCard key={listing.slug} listing={listing} />
            ))}
          </div>
        </section>
      ) : null}

      {recent.length > 1 ? (
        <section className="mt-12 border-t border-border pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-subtle-foreground">
            Previously
          </h2>
          <ul className="mt-3 flex flex-col divide-y divide-border">
            {recent
              .filter((d) => d.date !== drop.date)
              .map((d) => (
                <li key={d.date}>
                  <Link
                    href={`/drop?date=${d.date}`}
                    className="flex items-baseline gap-4 py-2.5 transition-colors hover:text-accent"
                  >
                    <span className="w-28 shrink-0 font-mono text-[12px] tabular-nums text-subtle-foreground">
                      {formatDate(Date.parse(d.date))}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[14px]">
                      {d.headline}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
