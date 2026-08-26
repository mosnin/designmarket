import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BrowsePage, ResultGrid } from "@/components/browse/browse-page";
import { EmptyResults } from "@/components/browse/empty-results";
import { ComponentCard } from "@/components/cards/component-card";
import { KindRail } from "@/components/facets/kind-rail";
import {
  getComponentFacetCounts,
  getComponentKindCounts,
  getComponents,
  getListings,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { parseFacets, type SearchParamsInput } from "@/lib/search-params";
import { componentKindLabel } from "@/lib/taxonomy";
import type { SortKey } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Components",
  description:
    "Browse individual components across every library — not libraries. Filter by kind and by the stack you ship on.",
  path: "/components",
});

const LIMIT = 24;

export default async function ComponentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  const params = await searchParams;
  const kind = typeof params.kind === "string" ? params.kind : undefined;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const sort = typeof params.sort === "string" ? (params.sort as SortKey) : undefined;
  const renderableOnly = params.live === "1";
  const pageNumber = Math.max(1, Number.parseInt(String(params.page ?? "1"), 10) || 1);
  const active = parseFacets(params);

  const base = {
    ...(kind ? { kind } : {}),
    ...(q ? { q } : {}),
    ...(renderableOnly ? { renderableOnly } : {}),
  };

  const [page, kindCounts, facetCounts, listings] = await Promise.all([
    getComponents({
      ...base,
      ...(sort ? { sort } : {}),
      ...(Object.keys(active).length ? { facets: active } : {}),
      limit: LIMIT,
      offset: (pageNumber - 1) * LIMIT,
    }),
    getComponentKindCounts(),
    getComponentFacetCounts(base, active),
    getListings({ limit: 500 }),
  ]);

  const listingBySlug = new Map(listings.items.map((l) => [l.slug, l]));

  return (
    <BrowsePage
      eyebrow="The component index"
      title={
        kind ? `${componentKindLabel(kind)} components` : "Every component, indexed"
      }
      description={
        kind
          ? `Every ${componentKindLabel(kind).toLowerCase()} in the catalogue, across every library, side by side.`
          : "You don't browse libraries here — you browse the components inside them. Pick a kind, filter by what your repo can take, and see them running."
      }
      pathname="/components"
      params={params}
      active={active}
      counts={facetCounts}
      sort={sort}
      total={page.total}
      page={pageNumber}
      limit={LIMIT}
      noun="component"
      aside={
        <KindRail
          pathname="/components"
          params={params}
          current={kind}
          counts={kindCounts}
        />
      }
    >
      {page.items.length ? (
        <ResultGrid dense>
          {page.items.map((component) => (
            <ComponentCard
              key={component.slug}
              component={component}
              listing={listingBySlug.get(component.listingSlug)}
            />
          ))}
        </ResultGrid>
      ) : (
        <EmptyResults
          pathname="/components"
          params={params}
          active={active}
          counts={facetCounts}
          query={q}
        />
      )}
    </BrowsePage>
  );
}
