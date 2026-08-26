import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { seedListings } from "../lib/seed/listings";
import { seedComponents } from "../lib/seed/components";
import { seedCollections, seedDrops } from "../lib/seed/collections";

/**
 * Loads the bundled seed dataset into a deployment.
 *
 * Idempotent by slug: re-running patches existing rows rather than
 * duplicating them, so it is safe to run after editing `lib/seed/*`.
 *
 *   npx convex run seed:run
 *   npx convex run seed:run '{"reset": true}'
 */
export const run = internalMutation({
  args: { reset: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    if (args.reset) {
      for (const table of ["listingCategories", "components", "listings", "collections", "drops"] as const) {
        const rows = await ctx.db.query(table).collect();
        for (const row of rows) await ctx.db.delete(row._id);
      }
    }

    let listingsWritten = 0;
    const idBySlug = new Map<string, Id<"listings">>();

    for (const listing of seedListings) {
      const { _id: _ignored, ...fields } = listing;
      const existing = await ctx.db
        .query("listings")
        .withIndex("by_slug", (q) => q.eq("slug", listing.slug))
        .unique();

      const id = existing
        ? (await ctx.db.patch(existing._id, fields), existing._id)
        : await ctx.db.insert("listings", fields);

      idBySlug.set(listing.slug, id);
      listingsWritten += 1;

      // Rebuild the category join rows for this listing.
      const joins = await ctx.db
        .query("listingCategories")
        .withIndex("by_listing", (q) => q.eq("listingId", id))
        .collect();
      for (const j of joins) await ctx.db.delete(j._id);
      for (const category of listing.categories) {
        await ctx.db.insert("listingCategories", {
          listingId: id,
          listingSlug: listing.slug,
          category,
          kind: listing.kind,
          status: listing.status,
        });
      }
    }

    let componentsWritten = 0;
    for (const component of seedComponents) {
      const listingId = idBySlug.get(component.listingSlug);
      if (!listingId) continue;
      const { _id: _ignored, ...fields } = component;
      const existing = await ctx.db
        .query("components")
        .withIndex("by_slug", (q) => q.eq("slug", component.slug))
        .unique();
      const doc = { ...fields, listingId, status: "live" };
      if (existing) await ctx.db.patch(existing._id, doc);
      else await ctx.db.insert("components", doc);
      componentsWritten += 1;
    }

    for (const collection of seedCollections) {
      const { _id: _ignored, ...fields } = collection;
      const existing = await ctx.db
        .query("collections")
        .withIndex("by_slug", (q) => q.eq("slug", collection.slug))
        .unique();
      if (existing) await ctx.db.patch(existing._id, fields);
      else await ctx.db.insert("collections", fields);
    }

    for (const drop of seedDrops) {
      const existing = await ctx.db
        .query("drops")
        .withIndex("by_date", (q) => q.eq("date", drop.date))
        .unique();
      if (existing) await ctx.db.patch(existing._id, drop);
      else await ctx.db.insert("drops", drop);
    }

    return {
      listings: listingsWritten,
      components: componentsWritten,
      collections: seedCollections.length,
      drops: seedDrops.length,
    };
  },
});
