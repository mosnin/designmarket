import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { Collection, Drop } from "../lib/types";

function toCollection(doc: Doc<"collections">): Collection {
  const { _id, _creationTime: _ct, ownerId: _oid, ...rest } = doc;
  return { ...rest, _id } as Collection;
}

export const listPublic = query({
  args: { kind: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const kind = (args.kind ?? "stack") as Doc<"collections">["kind"];
    const docs = await ctx.db
      .query("collections")
      .withIndex("by_kind_visibility", (q) =>
        q.eq("kind", kind).eq("visibility", "public")
      )
      .collect();
    return docs
      .map(toCollection)
      .sort((a, b) => b.saves - a.saves)
      .slice(0, args.limit ?? 50);
  },
});

export const bySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("collections")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    return doc ? toCollection(doc) : null;
  },
});

export const drop = query({
  args: { date: v.optional(v.string()) },
  handler: async (ctx, args): Promise<Drop | null> => {
    if (args.date) {
      const doc = await ctx.db
        .query("drops")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .unique();
      if (!doc) return null;
      const { _id: _i, _creationTime: _ct, ...rest } = doc;
      return rest;
    }
    const docs = await ctx.db.query("drops").withIndex("by_date").order("desc").take(1);
    const doc = docs[0];
    if (!doc) return null;
    const { _id: _i, _creationTime: _ct, ...rest } = doc;
    return rest;
  },
});

export const recentDrops = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<Drop[]> => {
    const docs = await ctx.db
      .query("drops")
      .withIndex("by_date")
      .order("desc")
      .take(args.limit ?? 14);
    return docs.map(({ _id: _i, _creationTime: _ct, ...rest }) => rest);
  },
});
