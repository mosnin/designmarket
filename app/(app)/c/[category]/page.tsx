import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BrowsePage, ResultGrid } from "@/components/browse/browse-page";
import { EmptyResults } from "@/components/browse/empty-results";
import { ListingCard } from "@/components/cards/listing-card";
import { loadBrowse } from "@/lib/browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";
import { categories, categoryBySlug, sectionById } from "@/lib/taxonomy";

export function generateStaticParams(): { category: string }[] {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categoryBySlug.get(slug);
  if (!category) return {};
  return pageMetadata({
    title: category.name,
    description: category.blurb,
    path: `/c/${slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  const { category: slug } = await params;
  const category = categoryBySlug.get(slug);
  if (!category) notFound();

  const search = await searchParams;
  const pathname = `/c/${slug}`;
  const section = sectionById.get(category.section);
  const { page, counts, active, limit, pageNumber, sort, q } = await loadBrowse({
    searchParams: search,
    category: slug,
  });

  return (
    <BrowsePage
      eyebrow={section?.label ?? "Category"}
      title={category.name}
      description={category.blurb}
      pathname={pathname}
      params={search}
      active={active}
      counts={counts}
      sort={sort}
      total={page.total}
      page={pageNumber}
      limit={limit}
      noun="listing"
      sectionId={category.section}
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
          params={search}
          active={active}
          counts={counts}
          query={q}
        />
      )}
    </BrowsePage>
  );
}
