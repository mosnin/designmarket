import { Icon } from "@/components/icon";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  CompareCanvas,
  type ComparePair,
} from "@/components/compare/compare-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getComponent, getComponentKindCounts, getComponents, getListing } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { canRender } from "@/lib/registry-manifest";
import { componentKindLabel } from "@/lib/taxonomy";
import { brandInk, brandWash } from "@/lib/brand-color";

export const metadata: Metadata = pageMetadata({
  title: "Compare",
  description:
    "Put candidates side by side, driven by one set of props, and see which facts actually differ.",
  path: "/compare",
});

const MAX_COLUMNS = 4;

/**
 * The comparison lives entirely in the URL — `?items=a,b,c` — so a shortlist is
 * a link you can paste into a design review rather than a state you have to
 * describe.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ items?: string; kind?: string; remove?: string }>;
}): Promise<ReactNode> {
  const { items: rawItems, kind, remove } = await searchParams;

  const slugs = (rawItems ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => s !== remove)
    .slice(0, MAX_COLUMNS);

  const resolved = (await Promise.all(slugs.map((slug) => getComponent(slug)))).filter(
    (c) => c !== null
  );

  const pairs: ComparePair[] = await Promise.all(
    resolved.map(async (component) => ({
      component,
      listing: await getListing(component.listingSlug),
    }))
  );

  // Candidates to add: same kind as what is already picked, or the chosen kind.
  const targetKind = kind ?? resolved[0]?.kind;
  const [candidates, kindCounts] = await Promise.all([
    targetKind
      ? getComponents({ kind: targetKind, limit: 24, renderableOnly: true })
      : Promise.resolve({ items: [], total: 0, hasMore: false }),
    getComponentKindCounts(),
  ]);

  const candidateListings = await Promise.all(
    [...new Set(candidates.items.map((c) => c.listingSlug))].map((s) => getListing(s))
  );
  const listingBySlug = new Map(
    candidateListings.filter((l) => l !== null).map((l) => [l.slug, l])
  );

  const addHref = (slug: string): string => {
    const next = [...slugs, slug].slice(0, MAX_COLUMNS).join(",");
    return `/compare?items=${next}${targetKind ? `&kind=${targetKind}` : ""}`;
  };

  const comparableKinds = Object.entries(kindCounts)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);

  return (
    <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-6 lg:py-8">
      <header>
        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-foreground/40">
          Compare
        </p>
        <h1 className="font-serif text-3xl font-medium">
          {targetKind
            ? `${componentKindLabel(targetKind)} components, side by side`
            : "Put candidates side by side"}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Up to four at once, all driven by one set of props so you are comparing
          the same state — not whatever each library happened to default to. The
          facts table marks the rows where they actually differ.
        </p>
      </header>

      {pairs.length ? (
        <div className="mt-6">
          <CompareCanvas pairs={pairs} />
        </div>
      ) : (
        <div className="mt-6 rounded-md border border-dashed border-border bg-muted/50 px-6 py-12 text-center">
          <h2 className="font-serif text-lg font-medium">Pick a kind to compare</h2>
          <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            Every kind with more than one implementation in the catalogue can be
            compared.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {comparableKinds.map(([k, count]) => (
              <Button key={k} variant="outline" size="sm" asChild>
                <Link href={`/compare?kind=${k}`}>
                  {componentKindLabel(k)}
                  <span className="font-mono text-[11px] opacity-60">{count}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {targetKind && slugs.length < MAX_COLUMNS ? (
        <section className="mt-8 border-t border-border pt-6">
          <h2 className="text-[13px] font-semibold">
            Add another {componentKindLabel(targetKind).toLowerCase()}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {candidates.items
              .filter((c) => !slugs.includes(c.slug))
              .map((candidate) => {
                const parent = listingBySlug.get(candidate.listingSlug);
                return (
                  <Link
                    key={candidate.slug}
                    href={addHref(candidate.slug)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 py-1.5 pl-1.5 pr-3 text-[13px] transition-colors hover:border-foreground/20"
                  >
                    <span
                      className="flex size-5 items-center justify-center rounded-full font-mono text-[8px] font-semibold"
                      style={{
                        backgroundColor: brandWash(parent?.color ?? "var(--accent)", 20),
                        color: brandInk(parent?.color ?? "var(--accent)"),
                      }}
                    >
                      {parent?.monogram ?? "??"}
                    </span>
                    {candidate.name}
                    <span className="text-[11px] text-foreground/50">
                      {parent?.name}
                    </span>
                    <Icon name="plus" className="size-3.5 text-foreground/50" />
                  </Link>
                );
              })}
            {candidates.items.filter((c) => !slugs.includes(c.slug)).length === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                Nothing else of this kind renders here yet.{" "}
                <Link href="/submit" className="text-accent hover:underline">
                  Add one
                </Link>
                .
              </p>
            ) : null}
          </div>
          {candidates.items.some((c) => !canRender(c)) ? (
            <p className="mt-3 text-[11px] text-foreground/50">
              Only components the sandbox can actually run are offered here.
            </p>
          ) : null}
        </section>
      ) : null}

      {slugs.length >= MAX_COLUMNS ? (
        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          <Badge variant="outline">Four columns is the limit</Badge>{" "}
          <span className="ml-2">
            Past four, you are not comparing — you are browsing.
          </span>
        </p>
      ) : null}
    </div>
  );
}
