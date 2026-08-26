import { facets as facetDefs } from "./taxonomy";
import type { ListingQuery, SortKey } from "./types";

/**
 * Filters live in the URL, not in component state.
 *
 * That is the whole reason a faceted search is worth building: a filtered view
 * has to be a link you can send someone. "Every RSC-safe date picker that ships
 * types, MIT licensed" should be a URL, not a sequence of clicks you describe
 * in Slack.
 *
 * Encoding: one query param per facet, comma-separated values.
 *   /components?kind=date-picker&rsc=safe&license=mit&typescript=yes
 */

export const SORTS: { value: SortKey; label: string; hint: string }[] = [
  { value: "trending", label: "Trending", hint: "Adoption, release recency and Ship Score" },
  { value: "ship-score", label: "Ship Score", hint: "Our grade, highest first" },
  { value: "downloads", label: "Downloads", hint: "Weekly npm downloads" },
  { value: "stars", label: "Stars", hint: "GitHub stars" },
  { value: "updated", label: "Recently shipped", hint: "Last release or commit" },
  { value: "newest", label: "Newest here", hint: "Recently added to the catalogue" },
  { value: "alpha", label: "A–Z", hint: "Alphabetical" },
];

const SORT_VALUES = new Set(SORTS.map((s) => s.value));
const FACET_IDS = new Set(facetDefs.map((f) => f.id));

export type SearchParamsInput = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseFacets(params: SearchParamsInput): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const facet of facetDefs) {
    const raw = firstValue(params[facet.id]);
    if (!raw) continue;
    const allowed = new Set(facet.options.map((o) => o.value));
    const values = raw
      .split(",")
      .map((v) => v.trim())
      .filter((v) => allowed.has(v));
    if (values.length) out[facet.id] = facet.multi ? values : [values[0]!];
  }
  return out;
}

export function parseListingQuery(params: SearchParamsInput): ListingQuery {
  const sort = firstValue(params.sort);
  const q = firstValue(params.q)?.trim();
  const page = Number.parseInt(firstValue(params.page) ?? "1", 10);
  const limit = 24;
  const facets = parseFacets(params);

  return {
    ...(q ? { q } : {}),
    ...(sort && SORT_VALUES.has(sort as SortKey) ? { sort: sort as SortKey } : {}),
    ...(Object.keys(facets).length ? { facets } : {}),
    limit,
    offset: Number.isFinite(page) && page > 1 ? (page - 1) * limit : 0,
  };
}

export function countActiveFacets(facets: Record<string, string[]>): number {
  return Object.values(facets).reduce((sum, values) => sum + values.length, 0);
}

/**
 * Build the href for toggling one facet value, preserving everything else and
 * resetting pagination — a filter change always means a new first page.
 */
export function toggleFacetHref(
  pathname: string,
  current: SearchParamsInput,
  facetId: string,
  value: string
): string {
  const facet = facetDefs.find((f) => f.id === facetId);
  const params = new URLSearchParams();

  for (const [key, raw] of Object.entries(current)) {
    const single = firstValue(raw);
    if (!single || key === "page") continue;
    params.set(key, single);
  }

  const existing = (firstValue(current[facetId]) ?? "")
    .split(",")
    .filter(Boolean);

  let next: string[];
  if (existing.includes(value)) {
    next = existing.filter((v) => v !== value);
  } else if (facet?.multi) {
    next = [...existing, value];
  } else {
    next = [value];
  }

  if (next.length) params.set(facetId, next.join(","));
  else params.delete(facetId);

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function setParamHref(
  pathname: string,
  current: SearchParamsInput,
  key: string,
  value: string | null
): string {
  const params = new URLSearchParams();
  for (const [k, raw] of Object.entries(current)) {
    const single = firstValue(raw);
    if (!single || k === "page") continue;
    params.set(k, single);
  }
  if (value) params.set(key, value);
  else params.delete(key);
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function pageHref(
  pathname: string,
  current: SearchParamsInput,
  page: number
): string {
  const params = new URLSearchParams();
  for (const [k, raw] of Object.entries(current)) {
    const single = firstValue(raw);
    if (!single || k === "page") continue;
    params.set(k, single);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function clearFacetsHref(
  pathname: string,
  current: SearchParamsInput
): string {
  const params = new URLSearchParams();
  for (const [k, raw] of Object.entries(current)) {
    if (FACET_IDS.has(k) || k === "page") continue;
    const single = firstValue(raw);
    if (single) params.set(k, single);
  }
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
