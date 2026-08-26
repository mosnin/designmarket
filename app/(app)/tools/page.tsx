import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BrowsePage, ResultGrid } from "@/components/browse/browse-page";
import { EmptyResults } from "@/components/browse/empty-results";
import { ListingCard } from "@/components/cards/listing-card";
import { loadBrowse } from "@/lib/browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "AI tools",
  description:
    "Models, agents, MCP servers and the plumbing around them — graded on evidence, not upvotes.",
  path: "/tools",
});

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  const params = await searchParams;
  const { page, counts, active, limit, pageNumber, sort, q } = await loadBrowse({
    searchParams: params,
    kind: "tool",
  });

  return (
    <BrowsePage
      eyebrow="Tools"
      title="AI tools & infrastructure"
      description="Models, agents, MCP servers and the infrastructure underneath them. Same grading as everything else: licence, maintenance, adoption, docs — with the dimensions that can't apply to a hosted product marked N/A rather than scored zero."
      pathname="/tools"
      params={params}
      active={active}
      counts={counts}
      sort={sort}
      total={page.total}
      page={pageNumber}
      limit={limit}
      noun="tool"
    >
      {page.items.length ? (
        <ResultGrid>
          {page.items.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </ResultGrid>
      ) : (
        <EmptyResults
          pathname="/tools"
          params={params}
          active={active}
          counts={counts}
          query={q}
        />
      )}
    </BrowsePage>
  );
}
