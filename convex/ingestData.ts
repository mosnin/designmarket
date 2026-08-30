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
    return (
      listings
        // A listing with neither a repo nor an npm package has nothing to
        // fetch. Including it costs a scheduled job and, more importantly, a
        // slot at the front of the queue it can never leave.
        .filter((l) => l.repo || l.npm)
        // Oldest facts first, so a partial run still improves the worst data.
        // Never-fetched listings sort to the very front, and so do the ones a
        // refused source left unstamped — they get retried before anything
        // that already has good numbers.
        .sort((a, b) => (a.facts.fetchedAt ?? 0) - (b.facts.fetchedAt ?? 0))
        .slice(0, args.limit)
        .map((l) => l.slug)
    );
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
    /** Did every source this listing declares actually answer? */
    complete: v.boolean(),
  },
  handler: async (ctx, args) => {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!listing) return;

    const gained = Object.keys(args.facts).length > 0;
    if (!gained && !args.complete) return; // nothing learned, nothing to record

    // Merge rather than replace: a source that was unreachable this run should
    // not wipe a figure another source confirmed last run.
    await ctx.db.patch(listing._id, {
      facts: {
        ...listing.facts,
        ...args.facts,
        // `fetchedAt` is shown to readers as "refreshed N minutes ago" and is
        // the retry queue's sort key. Stamping it after GitHub refused us would
        // claim a refresh that did not happen *and* send the listing to the
        // back of the queue carrying the same blanks it arrived with — so a
        // rate-limited catalogue would take one full cycle per listing to fill
        // in. Partial results are still kept; only the timestamp waits.
        ...(args.complete ? { fetchedAt: Date.now() } : {}),
      },
      updatedAt: Date.now(),
    });
  },
});
