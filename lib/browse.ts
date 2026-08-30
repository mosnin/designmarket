import "server-only";

import { notFound } from "next/navigation";
import { getFacetCounts, getListings } from "./data";
import { parseFacets, parseListingQuery, type SearchParamsInput } from "./search-params";
import type { ListingKind } from "./types";

/**
 * The common work behind /explore, /libraries, /tools and /c/[category]:
 * parse the URL, run one query, and compute facet counts against the same
 * base so the numbers on the rail agree with the grid beside them.
 */
export async function loadBrowse({
  searchParams,
  kind,
  kinds,
  category,
}: {
  searchParams: SearchParamsInput;
  kind?: ListingKind;
  kinds?: string[];
  category?: string;
}) {
  const query = parseListingQuery(searchParams);
  const active = parseFacets(searchParams);
  const base = {
    ...(kind ? { kind } : {}),
    ...(kinds?.length ? { kinds } : {}),
    ...(category ? { category } : {}),
    ...(query.q ? { q: query.q } : {}),
  };

  const [page, counts] = await Promise.all([
    getListings({
      ...query,
      ...(kind ? { kind } : {}),
      ...(kinds?.length ? { kinds } : {}),
      ...(category ? { category } : {}),
    }),
    getFacetCounts(base, active),
  ]);

  const limit = query.limit ?? 24;
  return {
    page,
    counts,
    active,
    limit,
    pageNumber: Math.floor((query.offset ?? 0) / limit) + 1,
    sort: query.sort,
    q: query.q,
  };
}

export function requireCategory<T>(value: T | undefined): T {
  if (value === undefined) notFound();
  return value;
}
