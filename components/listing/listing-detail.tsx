import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { ComponentCard } from "@/components/cards/component-card";
import { Icon } from "@/components/icon";
import { CardPreview } from "@/components/preview/card-preview";
import { CommandLine } from "@/components/preview/code-panel";
import { SaveRailItem } from "@/components/save/save-button";
import { ShipScorePanel } from "@/components/ship-score-panel";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { IconTile } from "@/components/surface/icon-tile";
import { Badge, LiveBadge } from "@/components/ui/badge";
import {
  getComponents,
  getListing,
  getListings,
  getRelatedListings,
} from "@/lib/data";
import { kindLabel, listingHref } from "@/lib/links";
import { pageMetadata } from "@/lib/metadata";
import { canRender } from "@/lib/registry-manifest";
import {
  categoryBySlug,
  facetOptionLabel,
  sectionForKind,
} from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";
import { compactNumber, formatBytes, formatDate, timeAgo } from "@/lib/utils";

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

/* --------------------------------------------------------------- helpers */

/**
 * "What you get" is derived from facts we actually hold, never authored. A
 * listing cannot claim a bullet here — it earns one by having the fact behind
 * it, which is the same rule Ship Score runs on.
 */
function whatYouGet(listing: Listing, componentCount: number): string[] {
  const out: string[] = [];
  const f = listing.facts;

  if (componentCount > 0) {
    out.push(`${componentCount} components indexed here, rendered live`);
  }
  if (listing.stack.rsc === "safe") {
    out.push("Renders in a server component without a 'use client' boundary");
  }
  if (listing.stack.typescript) out.push("Ships its own TypeScript types");
  if (listing.stack.a11y === "audited") {
    out.push("Documented keyboard and screen-reader support");
  }
  if (f.dependencies === 0) out.push("Zero runtime dependencies");
  else if (f.dependencies !== undefined && f.dependencies <= 3) {
    out.push(`Only ${f.dependencies} runtime dependencies`);
  }
  if (f.bundleBytes && f.bundleBytes < 20_000) {
    out.push(`Under ${formatBytes(f.bundleBytes)} min+gzip`);
  }
  if (listing.licenseBucket === "mit" || listing.licenseBucket === "apache-2.0") {
    out.push(`${listing.license} licensed — ship it anywhere`);
  }
  if (listing.stack.install.includes("copy-paste")) {
    out.push("Copy the source into your repo — no package boundary");
  }
  if (listing.details?.transport) {
    out.push(`Reachable over ${listing.details.transport}`);
  }
  if (listing.details?.tools?.length) {
    out.push(`Exposes ${listing.details.tools.length} tools to an agent`);
  }
  if (listing.details?.openapi) out.push("Publishes an OpenAPI document");
  if (f.lastPublish && Date.now() - f.lastPublish < 30 * 86_400_000) {
    out.push("Released within the last month");
  }
  return out.slice(0, 8);
}

type MetaRow = { label: string; value: ReactNode };

function metaRows(listing: Listing): MetaRow[] {
  const f = listing.facts;
  const d = listing.details;
  const rows: MetaRow[] = [
    {
      label: "Pricing",
      value: (
        <span>
          <span className="font-medium text-foreground">
            {listing.pricing === "open-source"
              ? "Open source"
              : listing.pricing === "free"
                ? "Free"
                : listing.pricing === "freemium"
                  ? "Freemium"
                  : listing.pricing === "paid"
                    ? "Paid"
                    : listing.pricing}
          </span>
          {listing.priceNote ? (
            <span className="mt-0.5 block text-[12px] text-muted-foreground">
              {listing.priceNote}
            </span>
          ) : null}
        </span>
      ),
    },
    { label: "Licence", value: listing.license },
    {
      label: "Works with",
      value: listing.stack.frameworks
        .slice(0, 4)
        .map((v) => facetOptionLabel("framework", v))
        .join(", "),
    },
  ];

  if (f.weeklyDownloads) {
    rows.push({
      label: "Weekly downloads",
      value: `${compactNumber(f.weeklyDownloads)} on npm`,
    });
  }
  if (f.bundleBytes) {
    rows.push({ label: "Bundle", value: `${formatBytes(f.bundleBytes)} min+gzip` });
  }
  if (f.version) rows.push({ label: "Version", value: f.version });
  rows.push({
    label: "Last release",
    value: f.lastPublish ? formatDate(f.lastPublish) : "not fetched yet",
  });
  if (d?.transport) rows.push({ label: "Transport", value: d.transport });
  if (d?.auth) rows.push({ label: "Auth", value: d.auth });
  if (d?.baseUrl) {
    rows.push({
      label: "Base URL",
      value: <span className="break-all font-mono text-[12px]">{d.baseUrl}</span>,
    });
  }
  if (d?.rateLimit) rows.push({ label: "Rate limit", value: d.rateLimit });
  if (d?.trigger) rows.push({ label: "Fires when", value: d.trigger });
  if (d?.runsIn?.length) rows.push({ label: "Runs in", value: d.runsIn.join(", ") });
  if (d?.language) rows.push({ label: "Language", value: d.language });

  return rows;
}

/* ------------------------------------------------------------------ page */

export async function ListingDetail({ slug }: { slug: string }): Promise<ReactNode> {
  const listing = await getListing(slug);
  if (!listing) notFound();

  const section = sectionForKind(listing.kind);
  const primaryCategory = categoryBySlug.get(listing.categories[0] ?? "");

  const [components, related, sameSection] = await Promise.all([
    getComponents({ listingSlug: slug, limit: 12 }),
    getRelatedListings(slug, 5),
    getListings({
      ...(section?.kinds.length ? { kinds: [...section.kinds] } : {}),
      limit: 13,
      sort: "trending",
    }),
  ]);

  const showcase = components.items
    .filter((c) => canRender(c) && c.registryKey)
    .slice(0, 2);
  const bullets = whatYouGet(listing, components.total);
  const meta = metaRows(listing);
  const more = sameSection.items.filter((l) => l.slug !== slug).slice(0, 12);

  const installCommand = listing.npm ? `npm i ${listing.npm}` : null;

  return (
    <div className="mx-auto max-w-[92rem] px-4 pb-16 sm:px-6">
      {/* ------------------------------------------------------- breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 py-3 text-[12px] text-muted-foreground"
      >
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="text-foreground/50">/</span>
        <Link href={section?.href ?? "/explore"} className="hover:text-foreground">
          {section?.label ?? "Explore"}
        </Link>
        {primaryCategory ? (
          <>
            <span className="text-foreground/50">/</span>
            <Link href={`/c/${primaryCategory.slug}`} className="hover:text-foreground">
              {primaryCategory.name}
            </Link>
          </>
        ) : null}
        <span className="text-foreground/50">/</span>
        <span className="text-foreground">{listing.name}</span>
      </nav>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          {/* ---------------------------------------------------- header */}
          <header className="flex flex-wrap items-center gap-4 border-b border-border pb-5">
            <IconTile monogram={listing.monogram} color={listing.color} size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="flex items-center gap-2 font-serif text-[30px] font-medium leading-tight">
                {listing.name}
                {listing.verified ? (
                  <Icon name="check" size={18} className="text-accent" />
                ) : null}
              </h1>
              <p className="mt-1 text-[15px] text-muted-foreground">{listing.tagline}</p>
            </div>
            <div className="flex items-center gap-2">
              <ShipScoreChip listing={listing} size="md" />
              {listing.homepage ? (
                <a
                  href={listing.homepage}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-5 text-[14px] font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                  Visit website
                  <Icon name="external" size={15} />
                </a>
              ) : null}
            </div>
          </header>

          {/* ----------------------------------------------- media strip */}
          {showcase.length ? (
            <section className="mt-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {showcase.map((component) => (
                  <Link
                    key={component.slug}
                    href={`/components/${component.slug}`}
                    className="group relative block overflow-hidden rounded-sm border border-border bg-muted/50 dark:border-transparent"
                  >
                    <div className="absolute left-3 top-3 z-10">
                      <LiveBadge />
                    </div>
                    <div className="flex h-56 items-center justify-center bg-grid">
                      <CardPreview
                        registryKey={component.registryKey ?? ""}
                        fitHeight={200}
                      />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3">
                      <span className="text-[14px] font-medium">{component.name}</span>
                      <span className="ml-auto text-[12px] text-muted-foreground">
                        open playground
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {/* -------------------------------------------- about + meta */}
          <div className="mt-5 grid rounded-sm border border-border bg-muted/50 dark:border-transparent lg:grid-cols-[minmax(0,1fr)_15rem]">
            <div className="min-w-0 p-6 lg:p-7">
              <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                About
              </h2>
              <p className="mt-3 text-[19px] font-medium leading-snug tracking-tight">
                {listing.tagline}
              </p>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
                {listing.description}
              </p>

              {bullets.length ? (
                <>
                  <h2 className="mt-7 text-xs font-medium uppercase tracking-wider text-foreground/40">
                    What you get
                  </h2>
                  <ul className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-2 text-[13px] leading-relaxed">
                        <Icon
                          name="forward"
                          size={13}
                          className="mt-1 shrink-0 text-foreground/50"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {installCommand ? (
                <>
                  <h2 className="mt-7 text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Install
                  </h2>
                  <div className="mt-2 max-w-md">
                    <CommandLine command={installCommand} />
                  </div>
                </>
              ) : null}

              <h2 className="mt-7 text-xs font-medium uppercase tracking-wider text-foreground/40">
                Categories
              </h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {listing.categories.map((categorySlug) => {
                  const category = categoryBySlug.get(categorySlug);
                  if (!category) return null;
                  return (
                    <Link
                      key={categorySlug}
                      href={`/c/${categorySlug}`}
                      className="rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                    >
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <aside className="border-t border-border p-6 lg:border-l lg:border-t-0 lg:p-7">
              <dl className="flex flex-col gap-5">
                {meta.map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-[13px] leading-relaxed">{row.value}</dd>
                  </div>
                ))}

                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Links
                  </dt>
                  <dd className="mt-1.5 flex flex-col gap-1.5">
                    {[
                      { href: listing.repo, label: "Repository" },
                      { href: listing.docs, label: "Documentation" },
                      { href: listing.npm ? `https://npmjs.com/package/${listing.npm}` : undefined, label: "npm" },
                    ]
                      .filter((l): l is { href: string; label: string } => Boolean(l.href))
                      .map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {link.label}
                          <Icon name="external" size={12} />
                        </a>
                      ))}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

          {/* ------------------------------------------- indexed components */}
          {components.items.length ? (
            <section className="mt-12">
              <div className="mb-4 flex items-center gap-2">
                <h2 className="font-serif text-[22px] font-medium">
                  Components we index
                </h2>
                <LiveBadge />
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

          {/* ------------------------------------------------ more in section */}
          {more.length ? (
            <section className="mt-12">
              <h2 className="mb-4 font-serif text-[22px] font-medium">
                More in {section?.label ?? "the catalogue"}
              </h2>
              <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 xl:grid-cols-4">
                {more.map((item) => (
                  <Link
                    key={item.slug}
                    href={listingHref(item)}
                    className="flex items-center gap-3 rounded-sm px-2 py-2 transition-colors hover:bg-muted/50"
                  >
                    <IconTile
                      monogram={item.monogram}
                      color={item.color}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-medium">
                        {item.name}
                      </span>
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {item.tagline}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {/* -------------------------------------------------- utility rail */}
        <aside className="flex flex-col gap-7 pt-3">
          <ul className="flex flex-col gap-1">
            <li>
              <SaveRailItem target={{ type: "listing", slug: listing.slug }} />
            </li>
            {[
              { icon: "link" as const, label: "Copy link", href: listingHref(listing) },
              { icon: "alert" as const, label: "Report a problem", href: "/submit" },
            ].map((action) => (
              <li key={action.label}>
                <Link
                  href={action.href}
                  className="flex items-center gap-2.5 rounded-sm px-2 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  <Icon name={action.icon} size={15} />
                  {action.label}
                </Link>
              </li>
            ))}
          </ul>

          <ShipScorePanel listing={listing} />

          {related.length ? (
            <section>
              <h2 className="mb-2.5 text-[13px] font-semibold tracking-tight">
                Similar
              </h2>
              <ul className="flex flex-col gap-0.5">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={listingHref(item)}
                      className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 transition-colors hover:bg-muted/50"
                    >
                      <IconTile
                        monogram={item.monogram}
                        color={item.color}
                        size="sm"
                      />
                      <span className="min-w-0 flex-1 truncate text-[13px]">
                        {item.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section>
            <h2 className="mb-2 text-[13px] font-semibold tracking-tight">
              Kind
            </h2>
            <Badge variant="outline">{kindLabel(listing.kind)}</Badge>
            <p className="mt-2 text-[12px] leading-relaxed text-foreground/50">
              Facts on this page were last refreshed{" "}
              {listing.facts.fetchedAt ? timeAgo(listing.facts.fetchedAt) : "never"}.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
