import { v } from "convex/values";
import { query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { Listing, ComponentQuery, SortKey, UIComponent } from "../lib/types";
import {
  alternativeComponents,
  componentFacetCounts,
  componentKindCounts,
  queryComponents,
} from "../lib/query-engine";

function toComponent(doc: Doc<"components">): UIComponent {
  const { _id, _creationTime: _ct, listingId: _lid, ownerId: _oid, status: _s, ...rest } = doc;
  return { ...rest, _id } as UIComponent;
}

function toListing(doc: Doc<"listings">): Listing {
  const { _id, _creationTime: _ct, ...rest } = doc;
  return { ...rest, _id } as Listing;
}

async function liveListings(ctx: QueryCtx): Promise<Listing[]> {
  const docs = await ctx.db
    .query("listings")
    .withIndex("by_status_created", (q) => q.eq("status", "live"))
    .collect();
  return docs.map(toListing);
}

export const list = query({
  args: {
    kind: v.optional(v.string()),
    listingSlug: v.optional(v.string()),
    category: v.optional(v.string()),
    q: v.optional(v.string()),
    facets: v.optional(v.record(v.string(), v.array(v.string()))),
    sort: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    renderableOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let docs: Doc<"components">[];
    if (args.listingSlug) {
      docs = await ctx.db
        .query("components")
        .withIndex("by_listing", (q) => q.eq("listingSlug", args.listingSlug!))
        .collect();
    } else if (args.kind) {
      docs = await ctx.db
        .query("components")
        .withIndex("by_kind", (q) => q.eq("kind", args.kind!).eq("status", "live"))
        .collect();
    } else {
      docs = await ctx.db
        .query("components")
        .withIndex("by_status_created", (q) => q.eq("status", "live"))
        .collect();
    }

    const query_: ComponentQuery = {
      ...(args.kind ? { kind: args.kind } : {}),
      ...(args.listingSlug ? { listingSlug: args.listingSlug } : {}),
      ...(args.category ? { category: args.category } : {}),
      ...(args.q ? { q: args.q } : {}),
      ...(args.facets ? { facets: args.facets } : {}),
      ...(args.sort ? { sort: args.sort as SortKey } : {}),
      ...(args.limit !== undefined ? { limit: args.limit } : {}),
      ...(args.offset !== undefined ? { offset: args.offset } : {}),
      ...(args.renderableOnly ? { renderableOnly: args.renderableOnly } : {}),
    };

    return queryComponents(docs.map(toComponent), await liveListings(ctx), query_);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("components")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return doc ? toComponent(doc) : null;
  },
});

export const alternatives = query({
  args: { slug: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("components")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!doc) return [];
    const all = await ctx.db
      .query("components")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return alternativeComponents(
      all.map(toComponent),
      toComponent(doc),
      args.limit ?? 6
    );
  },
});

export const facetOptionCounts = query({
  args: {
    kind: v.optional(v.string()),
    category: v.optional(v.string()),
    q: v.optional(v.string()),
    renderableOnly: v.optional(v.boolean()),
    facets: v.optional(v.record(v.string(), v.array(v.string()))),
  },
  handler: async (ctx, args) => {
    const components = await ctx.db
      .query("components")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return componentFacetCounts(
      components.map(toComponent),
      await liveListings(ctx),
      {
        ...(args.kind ? { kind: args.kind } : {}),
        ...(args.category ? { category: args.category } : {}),
        ...(args.q ? { q: args.q } : {}),
        ...(args.renderableOnly ? { renderableOnly: args.renderableOnly } : {}),
      },
      args.facets ?? {}
    );
  },
});

export const kindCounts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("components")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return componentKindCounts(all.map(toComponent));
  },
});
