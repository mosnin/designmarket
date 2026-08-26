import { ArrowLeft, ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ComponentCard } from "@/components/cards/component-card";
import { CardPreview } from "@/components/preview/card-preview";
import { Playground } from "@/components/preview/playground";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAlternatives, getComponent, getListing } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { canRender } from "@/lib/registry-manifest";
import { componentKindLabel } from "@/lib/taxonomy";
import { brandInk, brandWash } from "@/lib/brand-color";
import { listingHref } from "@/lib/links";
import { compactNumber, formatBytes } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const component = await getComponent(slug);
  if (!component) return {};
  return pageMetadata({
    title: `${component.name} — ${component.listingSlug}`,
    description: component.description,
    path: `/components/${slug}`,
  });
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactNode> {
  const { slug } = await params;
  const component = await getComponent(slug);
  if (!component) notFound();

  const [listing, alternatives] = await Promise.all([
    getListing(component.listingSlug),
    getAlternatives(slug, 6),
  ]);

  const altListings = await Promise.all(
    [...new Set(alternatives.map((a) => a.listingSlug))].map((s) => getListing(s))
  );
  const altBySlug = new Map(
    altListings.filter((l) => l !== null).map((l) => [l.slug, l])
  );

  const renderable = canRender(component);

  return (
    <div className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/components"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All components
      </Link>

      <header className="mt-4 flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{componentKindLabel(component.kind)}</Badge>
            {renderable ? <LiveBadge /> : <Badge variant="outline">Links out</Badge>}
            {component.a11yNotes ? (
              <Badge variant="success">Accessibility documented</Badge>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {component.name}
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {component.description}
          </p>
        </div>

        {listing ? (
          <Link
            href={listingHref(listing)}
            className="flex shrink-0 items-center gap-3 rounded-md border border-border bg-surface p-3 shadow-card transition-colors hover:border-border-strong"
          >
            <span
              className="flex size-9 items-center justify-center rounded-sm font-mono text-[11px] font-semibold"
              style={{
                backgroundColor: brandWash(listing.color, 20),
                color: brandInk(listing.color),
              }}
            >
              {listing.monogram}
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] uppercase tracking-wider text-subtle-foreground">
                From
              </span>
              <span className="block truncate text-[13px] font-semibold">
                {listing.name}
              </span>
            </span>
            <ShipScoreChip listing={listing} />
          </Link>
        ) : null}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0">
          <Suspense
            fallback={
              <div className="h-96 animate-pulse rounded-md border border-border bg-surface-2" />
            }
          >
            <Playground
              component={component}
              {...(listing ? { listingName: listing.name } : {})}
            />
          </Suspense>
        </div>

        <aside className="flex flex-col gap-5">
          {listing ? (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                The library behind it
              </h2>
              <dl className="flex flex-col divide-y divide-border rounded-md border border-border bg-surface text-[13px]">
                {[
                  { label: "Licence", value: listing.license },
                  {
                    label: "Weekly downloads",
                    value: listing.facts.weeklyDownloads
                      ? compactNumber(listing.facts.weeklyDownloads)
                      : "Not fetched yet",
                  },
                  {
                    label: "Bundle",
                    value: listing.facts.bundleBytes
                      ? formatBytes(listing.facts.bundleBytes)
                      : "Not fetched yet",
                  },
                  {
                    label: "Runtime deps",
                    value:
                      listing.facts.dependencies === undefined
                        ? "Not fetched yet"
                        : String(listing.facts.dependencies),
                  },
                  { label: "RSC", value: listing.stack.rsc === "safe" ? "Safe" : "Client only" },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline gap-3 px-3 py-2">
                    <dt className="min-w-0 flex-1 text-muted-foreground">{row.label}</dt>
                    <dd className="shrink-0 font-mono text-[12px]">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {listing.homepage ? (
                <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                  <a href={listing.homepage} target="_blank" rel="noreferrer noopener">
                    Open {listing.name}
                    <ExternalLink />
                  </a>
                </Button>
              ) : null}
            </section>
          ) : null}

          {alternatives.length ? (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                Other takes on this
              </h2>
              <ul className="flex flex-col gap-1.5">
                {alternatives.map((alt) => {
                  const parent = altBySlug.get(alt.listingSlug);
                  return (
                    <li key={alt.slug}>
                      <Link
                        href={`/components/${alt.slug}`}
                        className="flex items-center gap-2.5 rounded-sm border border-border bg-surface px-2.5 py-2 transition-colors hover:border-border-strong"
                      >
                        <span
                          className="flex size-5 shrink-0 items-center justify-center rounded-[4px] font-mono text-[8px] font-semibold"
                          style={{
                            backgroundColor: brandWash(parent?.color ?? "var(--accent)", 20),
                            color: brandInk(parent?.color ?? "var(--accent)"),
                          }}
                        >
                          {parent?.monogram ?? "??"}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium">
                            {alt.name}
                          </span>
                          <span className="block truncate text-[11px] text-subtle-foreground">
                            {parent?.name ?? alt.listingSlug}
                          </span>
                        </span>
                        {canRender(alt) ? (
                          <span className="live-dot size-1.5 shrink-0 rounded-full bg-live" />
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
                <Link href={`/compare?kind=${component.kind}`}>
                  Compare them side by side
                </Link>
              </Button>
            </section>
          ) : null}
        </aside>
      </div>

      {alternatives.length ? (
        <section className="mt-12 border-t border-border pt-6">
          <h2 className="text-[15px] font-semibold tracking-tight">
            More {componentKindLabel(component.kind).toLowerCase()} components
          </h2>
          <div className="mt-3 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {alternatives.slice(0, 4).map((alt) => (
              <ComponentCard
                key={alt.slug}
                component={alt}
                listing={altBySlug.get(alt.listingSlug)}
                preview={
                  canRender(alt) && alt.registryKey ? (
                    <CardPreview registryKey={alt.registryKey} />
                  ) : undefined
                }
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
