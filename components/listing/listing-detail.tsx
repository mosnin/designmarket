import { Icon } from "@/components/icon";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CardArt } from "@/components/cards/card-art";
import { ComponentCard } from "@/components/cards/component-card";
import { ListingCard } from "@/components/cards/listing-card";
import { CommandLine } from "@/components/preview/code-panel";
import { CardPreview } from "@/components/preview/card-preview";
import { ShipScorePanel } from "@/components/ship-score-panel";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { brandInk, brandWash } from "@/lib/brand-color";
import {
  getComponents,
  getListing,
  getRelatedListings,
} from "@/lib/data";
import { kindLabel } from "@/lib/links";
import { pageMetadata } from "@/lib/metadata";
import { canRender } from "@/lib/registry-manifest";
import { categoryBySlug, facetOptionLabel, sectionForKind } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";
import { compactNumber, formatBytes, formatDate, timeAgo } from "@/lib/utils";

/**
 * Listings live at `/<section>/<slug>` so the sidebar can tell which market
 * you are in from the URL alone — no context threading, no client hint. The
 * page body is shared; each section's route is six lines.
 */
export async function listingMetadata(slug: string): Promise<Metadata> {
  const listing = await getListing(slug);
  if (!listing) return {};
  const section = sectionForKind(listing.kind);
  return pageMetadata({
    title: listing.name,
    description: listing.tagline,
    path: `${section?.href ?? "/l"}/${slug}`,
  });
}

/** The facts row — everything we fetched, with "not fetched" said out loud. */
function factList(listing: Listing): { label: string; value: string; hint?: string }[] {
  const f = listing.facts;
  const rows: { label: string; value: string; hint?: string }[] = [
    { label: "Licence", value: listing.license },
    {
      label: "Weekly downloads",
      value: f.weeklyDownloads ? compactNumber(f.weeklyDownloads) : "not fetched",
      hint: "npm downloads, last 7 days",
    },
    {
      label: "GitHub stars",
      value: f.githubStars ? compactNumber(f.githubStars) : "not fetched",
    },
    {
      label: "Bundle",
      value: f.bundleBytes ? formatBytes(f.bundleBytes) : "not fetched",
      hint: "min+gzip, from bundlephobia",
    },
    {
      label: "Runtime deps",
      value: f.dependencies === undefined ? "not fetched" : String(f.dependencies),
    },
    { label: "Latest version", value: f.version ?? "not fetched" },
    {
      label: "Last release",
      value: f.lastPublish ? timeAgo(f.lastPublish) : "not fetched",
    },
    {
      label: "First released",
      value: f.firstRelease ? formatDate(f.firstRelease) : "not fetched",
    },
  ];
  return rows;
}

function detailRows(listing: Listing): { label: string; value: string }[] {
  const d = listing.details;
  if (!d) return [];
  const rows: { label: string; value: string }[] = [];
  if (d.transport) rows.push({ label: "Transport", value: d.transport });
  if (d.auth) rows.push({ label: "Auth", value: d.auth });
  if (d.baseUrl) rows.push({ label: "Base URL", value: d.baseUrl });
  if (d.rateLimit) rows.push({ label: "Rate limit", value: d.rateLimit });
  if (d.openapi !== undefined) {
    rows.push({ label: "OpenAPI", value: d.openapi ? "published" : "none" });
  }
  if (d.trigger) rows.push({ label: "Fires when", value: d.trigger });
  if (d.runsIn?.length) rows.push({ label: "Runs in", value: d.runsIn.join(", ") });
  if (d.language) rows.push({ label: "Language", value: d.language });
  if (d.shape) rows.push({ label: "Shape", value: d.shape });
  return rows;
}

export async function ListingDetail({
  slug,
}: {
  slug: string;
}): Promise<ReactNode> {
  const listing = await getListing(slug);
  if (!listing) notFound();

  const [components, related] = await Promise.all([
    getComponents({ listingSlug: slug, limit: 8 }),
    getRelatedListings(slug, 6),
  ]);

  const section = sectionForKind(listing.kind);
  const facts = factList(listing);
  const details = detailRows(listing);
  const installCommand = listing.npm
    ? `npm i ${listing.npm}`
    : listing.stack.install.includes("cli")
      ? `npx ${listing.slug}@latest`
      : null;

  return (
    <div className="mx-auto max-w-[80rem] px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href={section?.href ?? "/explore"}
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="back" className="size-3.5" />
        {section?.label ?? "Explore"}
      </Link>

      <header className="mt-4 flex flex-wrap items-start gap-5">
        <CardArt
          monogram={listing.monogram}
          color={listing.color}
          className="size-20 shrink-0 rounded-md border border-border"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{kindLabel(listing.kind)}</Badge>
            {listing.verified ? (
              <Badge variant="accent">Verified</Badge>
            ) : null}
            {listing.componentCount > 0 ? <LiveBadge /> : null}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {listing.name}
          </h1>
          <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {listing.tagline}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {listing.homepage ? (
              <Button variant="primary" size="sm" asChild>
                <a href={listing.homepage} target="_blank" rel="noreferrer noopener">
                  Open {listing.name}
                  <Icon name="external" />
                </a>
              </Button>
            ) : null}
            {listing.repo ? (
              <Button variant="outline" size="sm" asChild>
                <a href={listing.repo} target="_blank" rel="noreferrer noopener">
                  Repository
                </a>
              </Button>
            ) : null}
            {listing.docs ? (
              <Button variant="ghost" size="sm" asChild>
                <a href={listing.docs} target="_blank" rel="noreferrer noopener">
                  Docs
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <section>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              What it is
            </h2>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed">
              {listing.description}
            </p>
          </section>

          {installCommand ? (
            <section className="mt-6 max-w-2xl">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                Install
              </h2>
              <CommandLine command={installCommand} />
            </section>
          ) : null}

          {details.length ? (
            <section className="mt-6 max-w-2xl">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                {kindLabel(listing.kind)} details
              </h2>
              <dl className="divide-y divide-border rounded-md border border-border bg-surface text-[13px]">
                {details.map((row) => (
                  <div key={row.label} className="flex gap-4 px-3 py-2">
                    <dt className="w-28 shrink-0 text-muted-foreground">{row.label}</dt>
                    <dd className="min-w-0 flex-1 break-words font-mono text-[12px]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {listing.details?.tools?.length ? (
            <section className="mt-6">
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                Tools it exposes
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {listing.details.tools.map((tool) => (
                  <Badge key={tool} variant="outline" className="font-mono">
                    {tool}
                  </Badge>
                ))}
              </div>
            </section>
          ) : null}

          {components.items.length ? (
            <section className="mt-8">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-[15px] font-semibold tracking-tight">
                  Components we index
                </h2>
                <LiveBadge />
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {components.items.map((component) => (
                  <ComponentCard
                    key={component.slug}
                    component={component}
                    listing={listing}
                    preview={
                      canRender(component) && component.registryKey ? (
                        <CardPreview registryKey={component.registryKey} />
                      ) : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ) : null}

          {related.length ? (
            <section className="mt-10 border-t border-border pt-6">
              <h2 className="text-[15px] font-semibold tracking-tight">Related</h2>
              <div className="mt-3 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((item) => (
                  <ListingCard key={item.slug} listing={item} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="flex flex-col gap-5">
          <ShipScorePanel listing={listing} />

          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              The facts
            </h2>
            <dl className="divide-y divide-border rounded-md border border-border bg-surface text-[13px]">
              {facts.map((row) => (
                <div key={row.label} className="flex items-baseline gap-3 px-3 py-2">
                  <dt className="min-w-0 flex-1 text-muted-foreground" title={row.hint}>
                    {row.label}
                  </dt>
                  <dd
                    className={
                      row.value === "not fetched"
                        ? "shrink-0 font-mono text-[11px] italic text-subtle-foreground"
                        : "shrink-0 font-mono text-[12px]"
                    }
                  >
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              Works with
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {listing.stack.frameworks.map((v) => (
                <Badge key={v} variant="outline">
                  {facetOptionLabel("framework", v)}
                </Badge>
              ))}
              {listing.stack.styling.map((v) => (
                <Badge key={v} variant="outline">
                  {facetOptionLabel("styling", v)}
                </Badge>
              ))}
              {listing.stack.rsc === "safe" ? (
                <Badge variant="success">RSC-safe</Badge>
              ) : null}
              {listing.stack.typescript ? (
                <Badge variant="outline">Ships types</Badge>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              Categories
            </h2>
            <ul className="flex flex-col gap-1">
              {listing.categories.map((slug) => {
                const category = categoryBySlug.get(slug);
                if (!category) return null;
                return (
                  <li key={slug}>
                    <Link
                      href={`/c/${slug}`}
                      className="block rounded-sm px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          {listing.tags.length ? (
            <section>
              <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full px-2 py-0.5 font-mono text-[11px]"
                    style={{
                      backgroundColor: brandWash(listing.color, 14),
                      color: brandInk(listing.color),
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
