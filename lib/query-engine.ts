import type {
  Collection,
  ComponentQuery,
  Listing,
  ListingQuery,
  Page,
  SortKey,
  UIComponent,
} from "./types";
import { categoryBySlug, facets as facetDefs } from "./taxonomy";
import { computeShipScore } from "./ship-score";

/**
 * The in-memory query engine.
 *
 * It runs over the bundled seed dataset so the app is fully browsable with no
 * deployment, and it is also the reference for what the Convex queries must
 * return — same filters, same sorts, same shapes. Keeping one implementation
 * of the *semantics* means the two paths can't quietly diverge.
 */

const DAY = 86_400_000;

/* ------------------------------------------------------------------ facets */

/**
 * A listing matches a facet group when it matches ANY selected value within
 * that group, and ALL groups must match. That is the behaviour people expect
 * from faceted search and the opposite of what a naive `every` gives you.
 */
export function matchesFacets(
  listing: Listing,
  facets: Record<string, string[]> | undefined
): boolean {
  if (!facets) return true;
  for (const [facetId, values] of Object.entries(facets)) {
    if (!values.length) continue;
    const has = values.some((value) => listingHasFacetValue(listing, facetId, value));
    if (!has) return false;
  }
  return true;
}

function listingHasFacetValue(listing: Listing, facetId: string, value: string): boolean {
  switch (facetId) {
    case "framework":
      return listing.stack.frameworks.includes(value);
    case "styling":
      return listing.stack.styling.includes(value);
    case "react":
      return listing.stack.react === value || listing.stack.react === "any";
    case "rsc":
      return listing.stack.rsc === value;
    case "license":
      return listing.licenseBucket === value;
    case "pricing":
      return listing.pricing === value;
    case "typescript":
      return value === "yes" ? listing.stack.typescript : !listing.stack.typescript;
    case "a11y":
      return listing.stack.a11y === value;
    case "install":
      return listing.stack.install.includes(value);
    case "transport":
      return listing.details?.transport === value ||
        (value !== "both" && listing.details?.transport === "both");
    case "authmode":
      return authMode(listing.details?.auth) === value;
    default:
      return true;
  }
}

/**
 * The auth facet is derived from the prose we already record rather than being
 * a second field to keep in sync — "Restricted API key" and "Figma personal
 * access token" are both a token, and a listing should not have to say so
 * twice.
 */
function authMode(auth: string | undefined): "none" | "oauth" | "token" | null {
  if (!auth) return null;
  const value = auth.toLowerCase();
  if (value.startsWith("none")) return "none";
  if (value.includes("oauth")) return "oauth";
  return "token";
}

/** How many facet groups a listing satisfies — used to rank near-misses. */
export function facetMatchScore(
  listing: Listing,
  facets: Record<string, string[]> | undefined
): { matched: number; total: number; missing: string[] } {
  if (!facets) return { matched: 0, total: 0, missing: [] };
  const missing: string[] = [];
  let matched = 0;
  let total = 0;
  for (const [facetId, values] of Object.entries(facets)) {
    if (!values.length) continue;
    total += 1;
    if (values.some((v) => listingHasFacetValue(listing, facetId, v))) matched += 1;
    else missing.push(facetId);
  }
  return { matched, total, missing };
}

/* ------------------------------------------------------------------ search */

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((t) => t.length > 1);
}

function listingSearchScore(listing: Listing, tokens: string[]): number {
  if (!tokens.length) return 0;
  const name = listing.name.toLowerCase();
  const slug = listing.slug.toLowerCase();
  const tagline = listing.tagline.toLowerCase();
  const body = `${listing.description} ${listing.tags.join(" ")} ${listing.categories.join(" ")}`.toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (name === t || slug === t) score += 100;
    else if (name.startsWith(t) || slug.startsWith(t)) score += 60;
    else if (name.includes(t) || slug.includes(t)) score += 35;
    if (tagline.includes(t)) score += 12;
    if (body.includes(t)) score += 5;
  }
  // Require at least one real hit rather than returning the whole corpus.
  return score;
}

function componentSearchScore(c: UIComponent, tokens: string[]): number {
  if (!tokens.length) return 0;
  const name = c.name.toLowerCase();
  const kind = c.kind.toLowerCase();
  const body = `${c.description} ${c.tags.join(" ")} ${c.listingSlug}`.toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (name === t || kind === t) score += 100;
    else if (name.startsWith(t) || kind.startsWith(t)) score += 60;
    else if (name.includes(t) || kind.includes(t)) score += 30;
    if (body.includes(t)) score += 6;
  }
  return score;
}

/* ------------------------------------------------------------------- sorts */

/**
 * Trending blends attention with recency so a five-year-old library with a
 * million downloads doesn't permanently own the front page. Deliberately not
 * vote-driven — votes are the thing every other directory over-weights.
 */
export function trendingScore(listing: Listing, now: number): number {
  const ageDays = Math.max(1, (now - listing.createdAt) / DAY);
  const freshness = 1 / Math.log10(ageDays + 9);

  // On-site attention, which starts at zero and is earned from real events.
  const attention = listing.views / 100 + listing.saves / 4 + listing.votes / 2;

  // Off-site signal, so a brand new catalogue still ranks sensibly on day one.
  const downloads = listing.facts.weeklyDownloads ?? 0;
  const adoption = downloads > 0 ? Math.max(0, Math.log10(downloads) - 2) * 6 : 0;

  const shipped = listing.facts.lastPublish ?? listing.facts.lastCommit;
  const recentlyShipped = shipped
    ? Math.max(0, 1 - (now - shipped) / (180 * DAY)) * 24
    : 0;

  const graded = computeShipScore(listing);
  const quality = (graded.provisional ? graded.score * 0.75 : graded.score) / 4;

  return attention * freshness + adoption + recentlyShipped + quality;
}

function sortListings(items: Listing[], sort: SortKey, now: number): Listing[] {
  const copy = [...items];
  switch (sort) {
    case "newest":
      return copy.sort(
        (a, b) =>
          b.createdAt - a.createdAt ||
          (b.facts.firstRelease ?? 0) - (a.facts.firstRelease ?? 0)
      );
    case "ship-score":
      // A provisional score is ranked below a confirmed one at the same value:
      // "we graded this on twenty points" should not out-rank "we graded this
      // on a hundred and it still scored well".
      return copy.sort((a, b) => {
        const sa = computeShipScore(a);
        const sb = computeShipScore(b);
        const rank = (s: typeof sa): number =>
          s.score * (s.provisional ? 0.75 : 1) + s.applicableMax / 50;
        return rank(sb) - rank(sa);
      });
    case "stars":
      return copy.sort(
        (a, b) => (b.facts.githubStars ?? 0) - (a.facts.githubStars ?? 0)
      );
    case "updated":
      return copy.sort(
        (a, b) =>
          (b.facts.lastPublish ?? b.facts.lastCommit ?? 0) -
          (a.facts.lastPublish ?? a.facts.lastCommit ?? 0)
      );
    case "downloads":
      return copy.sort(
        (a, b) => (b.facts.weeklyDownloads ?? 0) - (a.facts.weeklyDownloads ?? 0)
      );
    case "alpha":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "trending":
    default:
      return copy.sort((a, b) => trendingScore(b, now) - trendingScore(a, now));
  }
}

/* ----------------------------------------------------------------- queries */

export function queryListings(
  all: Listing[],
  query: ListingQuery,
  now = Date.now()
): Page<Listing> {
  const {
    kind, kinds, category, q, facets,
    sort = "trending", limit = 24, offset = 0, featuredOnly,
  } = query;
  const tokens = q ? tokenize(q) : [];

  let items = all.filter((l) => l.status === "live");
  if (kinds?.length) {
    const wanted = new Set(kinds);
    items = items.filter((l) => wanted.has(l.kind));
  } else if (kind && kind !== "all") {
    items = items.filter((l) => l.kind === kind);
  }
  if (category) items = items.filter((l) => l.categories.includes(category));
  if (featuredOnly) items = items.filter((l) => l.featured);
  items = items.filter((l) => matchesFacets(l, facets));

  if (tokens.length) {
    const scored = items
      .map((l) => ({ l, s: listingSearchScore(l, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s);
    items = scored.map((x) => x.l);
  } else {
    items = sortListings(items, sort, now);
  }

  const total = items.length;
  return {
    items: items.slice(offset, offset + limit),
    total,
    hasMore: offset + limit < total,
  };
}

export function queryComponents(
  allComponents: UIComponent[],
  allListings: Listing[],
  query: ComponentQuery,
  now = Date.now()
): Page<UIComponent> {
  const {
    kind, listingSlug, category, q, facets,
    sort = "trending", limit = 24, offset = 0, renderableOnly,
  } = query;

  const listingBySlug = new Map(allListings.map((l) => [l.slug, l]));
  const tokens = q ? tokenize(q) : [];

  let items = allComponents.filter((c) => listingBySlug.has(c.listingSlug));
  if (kind) items = items.filter((c) => c.kind === kind);
  if (listingSlug) items = items.filter((c) => c.listingSlug === listingSlug);
  if (renderableOnly) items = items.filter((c) => c.previewMode !== "static");
  if (category) {
    items = items.filter((c) =>
      listingBySlug.get(c.listingSlug)?.categories.includes(category)
    );
  }
  if (facets) {
    items = items.filter((c) => {
      const l = listingBySlug.get(c.listingSlug);
      return l ? matchesFacets(l, facets) : false;
    });
  }

  if (tokens.length) {
    items = items
      .map((c) => ({ c, s: componentSearchScore(c, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.c);
  } else {
    items = [...items].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "alpha":
          return a.name.localeCompare(b.name);
        case "ship-score": {
          const la = listingBySlug.get(a.listingSlug);
          const lb = listingBySlug.get(b.listingSlug);
          return (
            (lb ? computeShipScore(lb).score : 0) - (la ? computeShipScore(la).score : 0)
          );
        }
        default: {
          // Renderable components rank above ones that only link out —
          // the whole promise of the page is that you can try them here.
          const renderable = (c: UIComponent): number => (c.previewMode === "static" ? 0 : 1);
          const featured = (c: UIComponent): number => (c.featured ? 1 : 0);
          const recency = (c: UIComponent): number =>
            1 / Math.log10(Math.max(1, (now - c.createdAt) / DAY) + 9);
          const score = (c: UIComponent): number =>
            renderable(c) * 60 + featured(c) * 40 + (c.views / 200 + c.saves / 6) * recency(c);
          return score(b) - score(a);
        }
      }
    });
  }

  const total = items.length;
  return {
    items: items.slice(offset, offset + limit),
    total,
    hasMore: offset + limit < total,
  };
}

/**
 * Counts for each facet option, computed the way faceted search is supposed to
 * work: a facet's own selections are excluded when counting its options, so
 * the numbers show what *adding* that value would give you rather than what
 * the current selection already returned. Zeroes are honest dead ends, which
 * is the whole point of showing counts at all.
 */
export function facetCounts(
  all: Listing[],
  base: { kind?: string; kinds?: string[]; category?: string; q?: string },
  active: Record<string, string[]>
): Record<string, Record<string, number>> {
  let pool = all.filter((l) => l.status === "live");
  if (base.kinds?.length) {
    const wanted = new Set(base.kinds);
    pool = pool.filter((l) => wanted.has(l.kind));
  } else if (base.kind && base.kind !== "all") {
    pool = pool.filter((l) => l.kind === base.kind);
  }
  if (base.category) pool = pool.filter((l) => l.categories.includes(base.category!));
  if (base.q) {
    const tokens = tokenize(base.q);
    pool = pool.filter((l) => listingSearchScore(l, tokens) > 0);
  }

  const out: Record<string, Record<string, number>> = {};
  for (const facet of facetDefs) {
    const others = Object.fromEntries(
      Object.entries(active).filter(([id]) => id !== facet.id)
    );
    const narrowed = pool.filter((l) => matchesFacets(l, others));
    out[facet.id] = {};
    for (const option of facet.options) {
      out[facet.id]![option.value] = narrowed.filter((l) =>
        listingHasFacetValue(l, facet.id, option.value)
      ).length;
    }
  }
  return out;
}

/** Same idea for the component index, where facets apply to the parent listing. */
export function componentFacetCounts(
  components: UIComponent[],
  listings: Listing[],
  base: { kind?: string; category?: string; q?: string; renderableOnly?: boolean },
  active: Record<string, string[]>
): Record<string, Record<string, number>> {
  const listingBySlug = new Map(listings.map((l) => [l.slug, l]));
  let pool = components.filter((c) => listingBySlug.has(c.listingSlug));
  if (base.kind) pool = pool.filter((c) => c.kind === base.kind);
  if (base.renderableOnly) pool = pool.filter((c) => c.previewMode !== "static");
  if (base.category) {
    pool = pool.filter((c) =>
      listingBySlug.get(c.listingSlug)?.categories.includes(base.category!)
    );
  }
  if (base.q) {
    const tokens = tokenize(base.q);
    pool = pool.filter((c) => componentSearchScore(c, tokens) > 0);
  }

  const out: Record<string, Record<string, number>> = {};
  for (const facet of facetDefs) {
    const others = Object.fromEntries(
      Object.entries(active).filter(([id]) => id !== facet.id)
    );
    const narrowed = pool.filter((c) => {
      const l = listingBySlug.get(c.listingSlug);
      return l ? matchesFacets(l, others) : false;
    });
    out[facet.id] = {};
    for (const option of facet.options) {
      out[facet.id]![option.value] = narrowed.filter((c) => {
        const l = listingBySlug.get(c.listingSlug);
        return l ? listingHasFacetValue(l, facet.id, option.value) : false;
      }).length;
    }
  }
  return out;
}

export function categoryCounts(all: Listing[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const l of all) {
    if (l.status !== "live") continue;
    for (const c of l.categories) {
      if (!categoryBySlug.has(c)) continue;
      counts[c] = (counts[c] ?? 0) + 1;
    }
  }
  return counts;
}

export function componentKindCounts(
  components: UIComponent[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of components) counts[c.kind] = (counts[c.kind] ?? 0) + 1;
  return counts;
}

/** Related listings: shared categories first, then shared tags, never itself. */
export function relatedListings(
  all: Listing[],
  listing: Listing,
  limit = 6
): Listing[] {
  const cats = new Set(listing.categories);
  const tags = new Set(listing.tags);
  return all
    .filter((l) => l.slug !== listing.slug && l.status === "live")
    .map((l) => {
      const catOverlap = l.categories.filter((c) => cats.has(c)).length;
      const tagOverlap = l.tags.filter((t) => tags.has(t)).length;
      return { l, score: catOverlap * 10 + tagOverlap * 3 + (l.featured ? 1 : 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l);
}

/** Alternatives for a component: same kind, different library. */
export function alternativeComponents(
  all: UIComponent[],
  component: UIComponent,
  limit = 6
): UIComponent[] {
  return all
    .filter(
      (c) =>
        c.slug !== component.slug &&
        (c.kind === component.kind ||
          c.tags.some((t) => component.tags.includes(t)))
    )
    .sort((a, b) => {
      const kindMatch = (c: UIComponent): number => (c.kind === component.kind ? 1 : 0);
      const renderable = (c: UIComponent): number => (c.previewMode === "static" ? 0 : 1);
      return (
        kindMatch(b) * 100 + renderable(b) * 20 + b.views / 1000 -
        (kindMatch(a) * 100 + renderable(a) * 20 + a.views / 1000)
      );
    })
    .slice(0, limit);
}

export function publicCollections(all: Collection[]): Collection[] {
  return all
    .filter((c) => c.visibility === "public")
    .sort((a, b) => b.saves - a.saves);
}
