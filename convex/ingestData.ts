import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

/**
 * The database half of ingestion, kept out of `ingest.ts` because that file
 * runs in the Node runtime and cannot touch the database directly.
 */

export const slugsForIngest = internalQuery({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();
    return listings
      // Oldest facts first, so a partial run still improves the worst data.
      .sort((a, b) => (a.facts.fetchedAt ?? 0) - (b.facts.fetchedAt ?? 0))
      .slice(0, args.limit)
      .map((l) => l.slug);
  },
});

export const listingForIngest = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!listing) return null;
    return { slug: listing.slug, repo: listing.repo, npm: listing.npm };
  },
});

export const applyFacts = internalMutation({
  args: {
    slug: v.string(),
    facts: v.object({
      githubStars: v.optional(v.number()),
      lastCommit: v.optional(v.number()),
      openIssues: v.optional(v.number()),
      weeklyDownloads: v.optional(v.number()),
      version: v.optional(v.string()),
      lastPublish: v.optional(v.number()),
      firstRelease: v.optional(v.number()),
      dependencies: v.optional(v.number()),
      npmLicense: v.optional(v.string()),
      bundleBytes: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!listing) return;

    // Merge rather than replace: a source that was unreachable this run should
    // not wipe a figure another source confirmed last run.
    await ctx.db.patch(listing._id, {
      facts: { ...listing.facts, ...args.facts, fetchedAt: Date.now() },
      updatedAt: Date.now(),
    });
  },
});
