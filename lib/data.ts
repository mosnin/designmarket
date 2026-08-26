import "server-only";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { seedCollections, seedComponents, seedDrops, seedListings } from "./seed";
import {
  alternativeComponents,
  categoryCounts,
  componentKindCounts,
  publicCollections,
  queryComponents,
  queryListings,
  relatedListings,
} from "./query-engine";
import type {
  Collection,
  ComponentQuery,
  Drop,
  Listing,
  ListingQuery,
  Page,
  UIComponent,
} from "./types";

/**
 * The data layer.
 *
 * Convex is the source of truth when a deployment is configured. When it isn't
 * — a fresh clone, a preview build, someone evaluating the repo — the bundled
 * seed dataset serves the same shapes, so the app is fully browsable before
 * anyone runs `npx convex dev`.
 *
 * A Convex call that throws also falls back rather than 500-ing the page: a
 * marketplace that can be read while its backend is having a bad day is worth
 * the twenty lines.
 */

const convexConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export function isLiveBackend(): boolean {
  return convexConfigured;
}

async function viaConvex<T>(
  run: () => Promise<T>,
  fallback: () => T,
  label: string
): Promise<T> {
  if (!convexConfigured) return fallback();
  try {
    return await run();
  } catch (error) {
    console.warn(`[data] Convex ${label} failed, serving seed data instead`, error);
    return fallback();
  }
}

/* ---------------------------------------------------------------- listings */

export async function getListings(query: ListingQuery = {}): Promise<Page<Listing>> {
  return viaConvex(
    () =>
      fetchQuery(api.listings.list, {
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.q ? { q: query.q } : {}),
        ...(query.facets ? { facets: query.facets } : {}),
        ...(query.sort ? { sort: query.sort } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
        ...(query.offset !== undefined ? { offset: query.offset } : {}),
        ...(query.featuredOnly ? { featuredOnly: query.featuredOnly } : {}),
      }) as Promise<Page<Listing>>,
    () => queryListings(seedListings, query),
    "listings.list"
  );
}

export async function getListing(slug: string): Promise<Listing | null> {
  return viaConvex(
    () => fetchQuery(api.listings.bySlug, { slug }) as Promise<Listing | null>,
    () => seedListings.find((l) => l.slug === slug) ?? null,
    "listings.bySlug"
  );
}

export async function getRelatedListings(
  slug: string,
  limit = 6
): Promise<Listing[]> {
  return viaConvex(
    () => fetchQuery(api.listings.related, { slug, limit }) as Promise<Listing[]>,
    () => {
      const listing = seedListings.find((l) => l.slug === slug);
      return listing ? relatedListings(seedListings, listing, limit) : [];
    },
    "listings.related"
  );
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  return viaConvex(
    () => fetchQuery(api.listings.counts, {}) as Promise<Record<string, number>>,
    () => categoryCounts(seedListings),
    "listings.counts"
  );
}

/* -------------------------------------------------------------- components */

export async function getComponents(
  query: ComponentQuery = {}
): Promise<Page<UIComponent>> {
  return viaConvex(
    () =>
      fetchQuery(api.components.list, {
        ...(query.kind ? { kind: query.kind } : {}),
        ...(query.listingSlug ? { listingSlug: query.listingSlug } : {}),
        ...(query.category ? { category: query.category } : {}),
        ...(query.q ? { q: query.q } : {}),
        ...(query.facets ? { facets: query.facets } : {}),
        ...(query.sort ? { sort: query.sort } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
        ...(query.offset !== undefined ? { offset: query.offset } : {}),
        ...(query.renderableOnly ? { renderableOnly: query.renderableOnly } : {}),
      }) as Promise<Page<UIComponent>>,
    () => queryComponents(seedComponents, seedListings, query),
    "components.list"
  );
}

export async function getComponent(slug: string): Promise<UIComponent | null> {
  return viaConvex(
    () => fetchQuery(api.components.bySlug, { slug }) as Promise<UIComponent | null>,
    () => seedComponents.find((c) => c.slug === slug) ?? null,
    "components.bySlug"
  );
}

export async function getAlternatives(
  slug: string,
  limit = 6
): Promise<UIComponent[]> {
  return viaConvex(
    () =>
      fetchQuery(api.components.alternatives, { slug, limit }) as Promise<UIComponent[]>,
    () => {
      const component = seedComponents.find((c) => c.slug === slug);
      return component ? alternativeComponents(seedComponents, component, limit) : [];
    },
    "components.alternatives"
  );
}

export async function getComponentKindCounts(): Promise<Record<string, number>> {
  return viaConvex(
    () => fetchQuery(api.components.kindCounts, {}) as Promise<Record<string, number>>,
    () => componentKindCounts(seedComponents),
    "components.kindCounts"
  );
}

/* ------------------------------------------------------------- collections */

export async function getStacks(limit = 50): Promise<Collection[]> {
  return viaConvex(
    () =>
      fetchQuery(api.collections.listPublic, { kind: "stack", limit }) as Promise<
        Collection[]
      >,
    () => publicCollections(seedCollections).slice(0, limit),
    "collections.listPublic"
  );
}

export async function getCollection(slug: string): Promise<Collection | null> {
  return viaConvex(
    () => fetchQuery(api.collections.bySlug, { slug }) as Promise<Collection | null>,
    () => seedCollections.find((c) => c.slug === slug) ?? null,
    "collections.bySlug"
  );
}

export async function getDrop(date?: string): Promise<Drop | null> {
  return viaConvex(
    () =>
      fetchQuery(api.collections.drop, date ? { date } : {}) as Promise<Drop | null>,
    () =>
      (date ? seedDrops.find((d) => d.date === date) : seedDrops[0]) ?? null,
    "collections.drop"
  );
}

export async function getRecentDrops(limit = 14): Promise<Drop[]> {
  return viaConvex(
    () => fetchQuery(api.collections.recentDrops, { limit }) as Promise<Drop[]>,
    () => seedDrops.slice(0, limit),
    "collections.recentDrops"
  );
}

/* ------------------------------------------------------------------ hydration */

/** Resolve a collection's item slugs into the real records, preserving order. */
export async function hydrateCollection(collection: Collection): Promise<{
  listings: Listing[];
  components: UIComponent[];
  notes: Record<string, string>;
}> {
  const notes: Record<string, string> = {};
  for (const item of collection.items) {
    if (item.note) notes[item.slug] = item.note;
  }
  const listingSlugs = collection.items.filter((i) => i.type === "listing").map((i) => i.slug);
  const componentSlugs = collection.items
    .filter((i) => i.type === "component")
    .map((i) => i.slug);

  const [listings, components] = await Promise.all([
    Promise.all(listingSlugs.map((s) => getListing(s))),
    Promise.all(componentSlugs.map((s) => getComponent(s))),
  ]);

  return {
    listings: listings.filter((l): l is Listing => l !== null),
    components: components.filter((c): c is UIComponent => c !== null),
    notes,
  };
}
