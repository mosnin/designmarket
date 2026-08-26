import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BrowsePage, ResultGrid } from "@/components/browse/browse-page";
import { EmptyResults } from "@/components/browse/empty-results";
import { ListingCard } from "@/components/cards/listing-card";
import { loadBrowse } from "@/lib/browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "Explore",
  description:
    "Every UI library, design system and AI tool in the catalogue, filterable by the stack you actually ship on.",
  path: "/explore",
});

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  const params = await searchParams;
  const { page, counts, active, limit, pageNumber, sort, q } = await loadBrowse({
    searchParams: params,
  });

  return (
    <BrowsePage
      title={q ? `Results for “${q}”` : "Explore"}
      description={
        q
          ? undefined
          : "Everything in the catalogue. Filter by what your repo can actually take — React version, RSC safety, styling engine, licence."
      }
      pathname="/explore"
      params={params}
      active={active}
      counts={counts}
      sort={sort}
      total={page.total}
      page={pageNumber}
      limit={limit}
      noun="listing"
    >
      {page.items.length ? (
        <ResultGrid>
          {page.items.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </ResultGrid>
      ) : (
        <EmptyResults
          pathname="/explore"
          params={params}
          active={active}
          counts={counts}
          query={q}
        />
      )}
    </BrowsePage>
  );
}
