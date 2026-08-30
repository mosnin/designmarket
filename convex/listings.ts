import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { Listing, ListingQuery, SortKey } from "../lib/types";
import {
  categoryCounts,
  facetCounts,
  queryListings,
  relatedListings,
} from "../lib/query-engine";

/**
 * Reads go through the same `lib/query-engine` the seed path uses.
 *
 * Convex narrows the candidate set with real indexes first (status+kind, or
 * the category join table), then the shared engine applies facets, search and
 * sorting. One implementation of the semantics, two sources of rows — the
 * seed dataset and the deployment can't drift apart.
 */

function toListing(doc: Doc<"listings">): Listing {
  const { _id, _creationTime: _ignored, ...rest } = doc;
  return { ...rest, _id } as Listing;
}

const facetsValidator = v.optional(v.record(v.string(), v.array(v.string())));

export const list = query({
  args: {
    kind: v.optional(v.string()),
    kinds: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    q: v.optional(v.string()),
    facets: facetsValidator,
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    featuredOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let docs: Doc<"listings">[];

    if (args.category) {
      const joins = await ctx.db
        .query("listingCategories")
        .withIndex("by_category", (q) =>
          q.eq("category", args.category!).eq("status", "live")
        )
        .collect();
      const fetched = await Promise.all(joins.map((j) => ctx.db.get(j.listingId)));
      docs = fetched.filter((d): d is Doc<"listings"> => d !== null);
    } else if (args.kind && args.kind !== "all") {
      docs = await ctx.db
        .query("listings")
        .withIndex("by_status_kind", (q) =>
          q.eq("status", "live").eq("kind", args.kind as Doc<"listings">["kind"])
        )
        .collect();
    } else {
      docs = await ctx.db
        .query("listings")
        .withIndex("by_status_created", (q) => q.eq("status", "live"))
        .collect();
    }

    const query_: ListingQuery = {
      ...(args.kind ? { kind: args.kind as ListingQuery["kind"] } : {}),
      ...(args.kinds?.length ? { kinds: args.kinds } : {}),
      ...(args.category ? { category: args.category } : {}),
      ...(args.q ? { q: args.q } : {}),
      ...(args.facets ? { facets: args.facets } : {}),
      ...(args.sort ? { sort: args.sort as SortKey } : {}),
      ...(args.limit !== undefined ? { limit: args.limit } : {}),
      ...(args.offset !== undefined ? { offset: args.offset } : {}),
      ...(args.featuredOnly ? { featuredOnly: args.featuredOnly } : {}),
    };

    return queryListings(docs.map(toListing), query_);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return doc ? toListing(doc) : null;
  },
});

export const related = query({
  args: { slug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!doc) return [];
    const all = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return relatedListings(all.map(toListing), toListing(doc), args.limit ?? 6);
  },
});

export const facetOptionCounts = query({
  args: {
    kind: v.optional(v.string()),
    kinds: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    q: v.optional(v.string()),
    facets: facetsValidator,
  },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return facetCounts(
      all.map(toListing),
      {
        ...(args.kind ? { kind: args.kind } : {}),
        ...(args.kinds?.length ? { kinds: args.kinds } : {}),
        ...(args.category ? { category: args.category } : {}),
        ...(args.q ? { q: args.q } : {}),
      },
      args.facets ?? {}
    );
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return categoryCounts(all.map(toListing));
  },
});
