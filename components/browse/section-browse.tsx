import type { ReactNode } from "react";
import { BrowsePage, ResultGrid } from "@/components/browse/browse-page";
import { EmptyResults } from "@/components/browse/empty-results";
import { ListingCard } from "@/components/cards/listing-card";
import { loadBrowse } from "@/lib/browse";
import type { SearchParamsInput } from "@/lib/search-params";
import { sectionById, type SectionId } from "@/lib/taxonomy";

/**
 * One browser, reused by every section. A new market gets a route file that is
 * four lines long, because nothing about browsing is section-specific except
 * which kinds it looks at and what it calls its listings.
 */
export async function SectionBrowse({
  sectionId,
  searchParams,
  noun,
  eyebrow,
  title,
  description,
}: {
  sectionId: SectionId;
  searchParams: SearchParamsInput;
  noun: string;
  eyebrow?: string;
  title?: string;
  description?: string;
}): Promise<ReactNode> {
  const section = sectionById.get(sectionId);
  const pathname = section?.href ?? "/explore";

  const { page, counts, active, limit, pageNumber, sort, q } = await loadBrowse({
    searchParams,
    ...(section?.kinds.length ? { kinds: [...section.kinds] } : {}),
  });

  return (
    <BrowsePage
      eyebrow={eyebrow ?? section?.label}
      title={q ? `Results for “${q}”` : (title ?? section?.label ?? "Browse")}
      description={q ? undefined : (description ?? section?.blurb)}
      pathname={pathname}
      params={searchParams}
      active={active}
      counts={counts}
      sort={sort}
      total={page.total}
      page={pageNumber}
      limit={limit}
      noun={noun}
      sectionId={sectionId}
    >
      {page.items.length ? (
        <ResultGrid>
          {page.items.map((listing) => (
            <ListingCard key={listing.slug} listing={listing} />
          ))}
        </ResultGrid>
      ) : (
        <EmptyResults
          pathname={pathname}
          params={searchParams}
          active={active}
          counts={counts}
          query={q}
        />
      )}
    </BrowsePage>
  );
}
