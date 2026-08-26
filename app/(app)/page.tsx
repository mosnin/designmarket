import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ComponentCard } from "@/components/cards/component-card";
import { ListingCard } from "@/components/cards/listing-card";
import { CategoryIcon } from "@/components/category-icon";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCategoryCounts,
  getComponents,
  getDrop,
  getListings,
  getStacks,
} from "@/lib/data";
import { categories } from "@/lib/taxonomy";

function SectionHeader({
  title,
  href,
  linkLabel,
  children,
}: {
  title: string;
  href: string;
  linkLabel: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          {title}
          {children}
        </h2>
      </div>
      <Link
        href={href}
        className="shrink-0 text-[13px] font-medium text-muted-foreground transition-colors hover:text-accent"
      >
        {linkLabel} <ArrowRight className="inline size-3.5" />
      </Link>
    </div>
  );
}

export default async function HomePage(): Promise<ReactNode> {
  const [featured, live, newest, stacks, drop, counts, all] = await Promise.all([
    getListings({ featuredOnly: true, limit: 6, sort: "ship-score" }),
    getComponents({ limit: 8, renderableOnly: true }),
    getListings({ limit: 6, sort: "updated" }),
    getStacks(3),
    getDrop(),
    getCategoryCounts(),
    getListings({ limit: 500 }),
  ]);

  const listingBySlug = new Map(all.items.map((l) => [l.slug, l]));

  const topCategories = categories
    .map((c) => ({ ...c, count: counts[c.slug] ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-6 lg:py-8">
      {drop ? (
        <Link
          href="/drop"
          className="group flex flex-col gap-3 rounded-md border border-border bg-surface p-5 shadow-card transition-all hover:border-border-strong hover:shadow-pop sm:flex-row sm:items-center sm:gap-6"
        >
          <div className="min-w-0 flex-1">
            <Badge variant="accent">
              <CalendarDays className="size-3" />
              Today&apos;s Drop
            </Badge>
            <p className="mt-2 font-display text-2xl leading-tight tracking-tight">
              {drop.headline}
            </p>
            <p className="mt-1.5 line-clamp-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
              {drop.note}
            </p>
          </div>
          <Button variant="secondary" size="sm" className="shrink-0 self-start sm:self-auto">
            Open the Drop
            <ArrowRight />
          </Button>
        </Link>
      ) : null}

      <section className="mt-10">
        <SectionHeader
          title="Running right now"
          href="/components"
          linkLabel="All components"
        >
          <LiveBadge />
        </SectionHeader>
        <p className="-mt-2 mb-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Individual components across every library, not the libraries
          themselves. Open one and it runs — in your own design tokens if you
          have set them.
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {live.items.map((component) => (
            <ComponentCard
              key={component.slug}
              component={component}
              listing={listingBySlug.get(component.listingSlug)}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          title="Highest Ship Score"
          href="/libraries?sort=ship-score"
          linkLabel="All libraries"
        />
        <p className="-mt-2 mb-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Graded on licence clarity, maintenance, adoption, accessibility, types,
          weight and dependencies — never on votes. Open any listing to see the
          arithmetic.
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.items.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader title="Stacks" href="/stacks" linkLabel="All stacks" />
        <p className="-mt-2 mb-3 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
          Curated sets that are actually installable — not a list of links.
        </p>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {stacks.map((stack) => (
            <Link
              key={stack.slug}
              href={`/stacks/${stack.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-md border border-border bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-border-strong hover:shadow-pop"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-0.5"
                style={{ background: stack.color }}
              />
              <h3 className="text-[15px] font-semibold tracking-tight">
                {stack.name}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
                {stack.description}
              </p>
              <p className="mt-3 font-mono text-[11px] text-subtle-foreground">
                {stack.items.length} items
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader
          title="Recently shipped"
          href="/explore?sort=updated"
          linkLabel="Everything"
        />
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {newest.items.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mt-12 border-t border-border pt-6">
        <h2 className="text-[15px] font-semibold tracking-tight">Browse by category</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {topCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/c/${category.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
            >
              <CategoryIcon name={category.icon} className="size-3.5" />
              {category.name}
              <span className="font-mono text-[11px] text-subtle-foreground">
                {category.count}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
