import Link from "next/link";
import type { ReactNode } from "react";
import { ComponentCard } from "@/components/cards/component-card";
import { StaggerItem, StaggerList } from "@/lib/motion";
import { Icon } from "@/components/icon";
import { CardPreview } from "@/components/preview/card-preview";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { IconTile, IconTileStack } from "@/components/surface/icon-tile";
import { ListingRow } from "@/components/surface/listing-row";
import { Panel } from "@/components/surface/panel";
import { SectionHeading } from "@/components/surface/section-heading";
import { ShaderHero } from "@/components/theme/shader-hero";
import { LiveBadge } from "@/components/ui/badge";
import {
  getCategoryCounts,
  getComponents,
  getDrop,
  getListings,
  getStacks,
} from "@/lib/data";
import { listingHref } from "@/lib/links";
import { canRender } from "@/lib/registry-manifest";
import { categories, sections } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";
import { compactNumber } from "@/lib/utils";

export default async function HomePage(): Promise<ReactNode> {
  const [live, newest, featured, stacks, drop, counts, all] = await Promise.all([
    getComponents({ limit: 4, renderableOnly: true }),
    getListings({ limit: 12, sort: "newest" }),
    getListings({ featuredOnly: true, limit: 12, sort: "ship-score" }),
    getStacks(3),
    getDrop(),
    getCategoryCounts(),
    getListings({ limit: 500 }),
  ]);

  const bySlug = new Map(all.items.map((l) => [l.slug, l]));
  const renderable = all.items.reduce((sum, l) => sum + l.componentCount, 0);

  const topCategories = categories
    .map((category) => ({ ...category, count: counts[category.slug] ?? 0 }))
    .filter((category) => category.count > 0)
    .sort((a, b) => b.count - a.count);

  const mostAdopted = [...all.items]
    .filter((l) => l.facts.weeklyDownloads)
    .sort((a, b) => (b.facts.weeklyDownloads ?? 0) - (a.facts.weeklyDownloads ?? 0))
    .slice(0, 6);

  return (
    <div>
      <ShaderHero live={renderable} />

      <div className="mx-auto max-w-[86rem] px-5 py-14 sm:px-8 lg:py-20">
        {/* ------------------------------------------------ running right now */}
        <section>
          <SectionHeading
            title="Running right now"
            href="/components"
            linkLabel="All components"
            aside={<LiveBadge />}
          />
          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {live.items.map((component) => (
              <StaggerItem key={component.slug}>
              <ComponentCard
                component={component}
                listing={bySlug.get(component.listingSlug)}
                preview={
                  canRender(component) && component.registryKey ? (
                    <CardPreview registryKey={component.registryKey} />
                  ) : undefined
                }
              />
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        {/* --------------------------------------------------- new additions */}
        <section className="mt-20">
          <SectionHeading title="New additions" href="/explore?sort=newest" />
          <StaggerList className="grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-4">
            {newest.items.map((listing) => (
              <StaggerItem key={listing.slug}>
                <ListingRow listing={listing} />
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        {/* ------------------------------------------------ featured / graded */}
        <section className="mt-20">
          <SectionHeading
            title="Highest Ship Score"
            href="/explore?sort=ship-score"
            linkLabel="See the grading"
          />
          <StaggerList className="grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-4">
            {featured.items.map((listing) => (
              <StaggerItem key={listing.slug}>
                <ListingRow listing={listing} />
              </StaggerItem>
            ))}
          </StaggerList>
        </section>

        {/* -------------------------------------- categories + most adopted */}
        <section className="mt-20 grid gap-6 lg:grid-cols-2">
          <div>
            <SectionHeading title="Explore markets" href="/explore" />
            <Panel className="p-2">
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {sections
                  .filter((s) => s.hasCategories)
                  .map((section) => {
                    const count = categories
                      .filter((c) => c.section === section.id)
                      .reduce((sum, c) => sum + (counts[c.slug] ?? 0), 0);
                    return (
                      <Link
                        key={section.id}
                        href={section.href}
                        className="t-press group flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-surface-2"
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-surface-2 text-muted-foreground transition-colors group-hover:text-foreground">
                          <Icon name={section.id as never} size={18} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-medium">
                            {section.label}
                          </span>
                          <span className="block text-[13px] text-muted-foreground">
                            {count} listings
                          </span>
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </Panel>
          </div>

          <div>
            <SectionHeading title="Most adopted" href="/explore?sort=downloads" />
            <Panel className="p-2">
              {mostAdopted.map((listing) => (
                <Link
                  key={listing.slug}
                  href={listingHref(listing)}
                  className="t-press flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2"
                >
                  <IconTile
                    monogram={listing.monogram}
                    color={listing.color}
                    size="sm"
                  />
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">
                    {listing.name}
                  </span>
                  <span className="shrink-0 font-mono text-[12px] text-muted-foreground">
                    {compactNumber(listing.facts.weeklyDownloads ?? 0)}/wk
                  </span>
                  <ShipScoreChip listing={listing} />
                </Link>
              ))}
            </Panel>
          </div>
        </section>

        {/* -------------------------------------------------------- stacks */}
        <section className="mt-20">
          <SectionHeading
            title="Installable stacks"
            href="/stacks"
            linkLabel="All stacks"
          />
          <StaggerList className="grid gap-4 lg:grid-cols-3">
            {stacks.map((stack) => {
              const tiles = stack.items
                .map((item) => bySlug.get(item.slug))
                .filter((l): l is Listing => Boolean(l))
                .map((l) => ({ monogram: l.monogram, color: l.color }));
              return (
                <Link
                  key={stack.slug}
                  href={`/stacks/${stack.slug}`}
                  className="t-lift group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 hover:bg-surface-2 dark:border-transparent"
                >
                  <IconTileStack items={tiles} />
                  <h3 className="mt-5 text-[18px] font-semibold leading-snug tracking-tight">
                    {stack.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted-foreground">
                    {stack.description}
                  </p>
                  <p className="mt-auto pt-5 text-right text-[13px] text-subtle-foreground">
                    {stack.items.length} items
                  </p>
                </Link>
              );
            })}
          </StaggerList>
        </section>

        {/* ---------------------------------------------------- today's drop */}
        {drop ? (
          <section className="mt-20">
            <SectionHeading title="The Drop" href="/drop" linkLabel="Previous drops" />
            <Link
              href="/drop"
              className="t-lift block rounded-2xl border border-border bg-surface p-8 hover:bg-surface-2 dark:border-transparent sm:p-10"
            >
              <p className="font-mono text-[12px] uppercase tracking-wider text-accent">
                {drop.date}
              </p>
              <p className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                {drop.headline}
              </p>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                {drop.note}
              </p>
            </Link>
          </section>
        ) : null}

        {/* -------------------------------------------------- all categories */}
        <section className="mt-20">
          <SectionHeading title="Browse by category" />
          <div className="flex flex-wrap gap-2">
            {topCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/c/${category.slug}`}
                className="t-press inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-[13px] text-muted-foreground hover:border-border-strong hover:text-foreground"
              >
                {category.name}
                <span className="font-mono text-[11px] text-subtle-foreground">
                  {category.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
