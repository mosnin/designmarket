import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BrowsePage, ResultGrid } from "@/components/browse/browse-page";
import { EmptyResults } from "@/components/browse/empty-results";
import { ListingCard } from "@/components/cards/listing-card";
import { loadBrowse } from "@/lib/browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "Component libraries",
  description:
    "Component libraries, design systems and headless primitives, graded on evidence and filterable by stack.",
  path: "/libraries",
});

export default async function LibrariesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  const params = await searchParams;
  const { page, counts, active, limit, pageNumber, sort, q } = await loadBrowse({
    searchParams: params,
    kind: "library",
  });

  return (
    <BrowsePage
      eyebrow="UI & Design"
      title="Component libraries & design systems"
      description="The kits you install once and live with for years. Every one is graded on licence clarity, maintenance, adoption, accessibility, types, weight and dependencies — and you can see the arithmetic."
      pathname="/libraries"
      params={params}
      active={active}
      counts={counts}
      sort={sort}
      total={page.total}
      page={pageNumber}
      limit={limit}
      noun="library"
      sectionId="ui"
    >
      {page.items.length ? (
        <ResultGrid>
          {page.items.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </ResultGrid>
      ) : (
        <EmptyResults
          pathname="/libraries"
          params={params}
          active={active}
          counts={counts}
          query={q}
        />
      )}
    </BrowsePage>
  );
}
