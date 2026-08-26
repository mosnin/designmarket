import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

/**
 * ADMIN
 * =====
 * Two roles, and the difference between them is deliberate: a moderator
 * decides what gets into the index, an admin decides who gets to decide. So
 * everything about listings is open to both, and everything about people —
 * roles, plans — is admin only.
 *
 * Every function here re-checks the caller's role against the database. The
 * middleware gate and the page gate are conveniences that stop a signed-out
 * visitor seeing a flash of admin chrome; this is the lock.
 */

type Role = "member" | "moderator" | "admin";

async function callerRole(ctx: QueryCtx | MutationCtx): Promise<Role | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  return profile?.role ?? null;
}

async function requireStaff(ctx: QueryCtx | MutationCtx): Promise<Role> {
  const role = await callerRole(ctx);
  if (role !== "admin" && role !== "moderator") throw new Error("Not allowed");
  return role;
}

async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  if ((await callerRole(ctx)) !== "admin") throw new Error("Admins only");
}

/* --------------------------------------------------------------- overview */

export const stats = query({
  args: {},
  handler: async (ctx) => {
    await requireStaff(ctx);

    const [pending, live, rejected, drafts, profiles, components] = await Promise.all([
      ctx.db
        .query("listings")
        .withIndex("by_status_created", (q) => q.eq("status", "pending"))
        .collect(),
      ctx.db
        .query("listings")
        .withIndex("by_status_created", (q) => q.eq("status", "live"))
        .collect(),
      ctx.db
        .query("listings")
        .withIndex("by_status_created", (q) => q.eq("status", "rejected"))
        .collect(),
      ctx.db
        .query("listings")
        .withIndex("by_status_created", (q) => q.eq("status", "draft"))
        .collect(),
      ctx.db.query("profiles").collect(),
      ctx.db.query("components").collect(),
    ]);

    // "How much of the index is actually graded on evidence" is the number
    // worth watching here — a catalogue full of listings with no fetched facts
    // is a catalogue of links with opinions attached.
    const withFacts = live.filter((l) => l.facts?.fetchedAt).length;
    const stale = live.filter((l) => {
      const at = l.facts?.fetchedAt;
      return !at || Date.now() - at > 7 * 86_400_000;
    }).length;

    return {
      pending: pending.length,
      live: live.length,
      rejected: rejected.length,
      drafts: drafts.length,
      components: components.length,
      members: profiles.length,
      pro: profiles.filter((p) => p.plan === "pro").length,
      staff: profiles.filter((p) => p.role !== "member").length,
      withFacts,
      stale,
    };
  },
});

/* --------------------------------------------------------------- listings */

const STALE_AFTER = 7 * 86_400_000;

function summarise(row: Doc<"listings">) {
  const fetchedAt = row.facts?.fetchedAt ?? null;
  return {
    id: row._id as string,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    kind: row.kind,
    status: row.status,
    categories: row.categories,
    license: row.license,
    pricing: row.pricing,
    featured: row.featured,
    verified: row.verified,
    color: row.color,
    monogram: row.monogram,
    repo: row.repo ?? null,
    npm: row.npm ?? null,
    homepage: row.homepage ?? null,
    componentCount: row.componentCount,
    submittedByHandle: row.submittedByHandle ?? null,
    fetchedAt,
    // Decided here rather than in the component: the server owns the clock,
    // and a render that calls Date.now() is a render that isn't pure.
    stale: !fetchedAt || Date.now() - fetchedAt > STALE_AFTER,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const listings = query({
  args: {
    status: v.optional(v.string()),
    q: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const limit = Math.min(args.limit ?? 100, 300);

    const rows = args.status
      ? await ctx.db
          .query("listings")
          .withIndex("by_status_created", (q) =>
            q.eq("status", args.status as Doc<"listings">["status"])
          )
          .order("desc")
          .take(limit)
      : await ctx.db.query("listings").order("desc").take(limit);

    const needle = args.q?.trim().toLowerCase();
    const filtered = needle
      ? rows.filter(
          (r) =>
            r.name.toLowerCase().includes(needle) ||
            r.slug.includes(needle) ||
            r.tagline.toLowerCase().includes(needle)
        )
      : rows;

    return filtered.map(summarise);
  },
});

/**
 * One patch endpoint rather than five toggles.
 *
 * Every field here is one a human decides — status, whether to feature it,
 * whether a maintainer has proved they own it. Nothing that gets fetched is
 * writable from this surface, so an admin can never quietly hand a listing a
 * download count it did not earn.
 */
export const patchListing = mutation({
  args: {
    id: v.id("listings"),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("live"),
        v.literal("rejected")
      )
    ),
    featured: v.optional(v.boolean()),
    verified: v.optional(v.boolean()),
    name: v.optional(v.string()),
    tagline: v.optional(v.string()),
    description: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    pricing: v.optional(v.string()),
    priceNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const { id, ...rest } = args;
    const listing = await ctx.db.get(id);
    if (!listing) throw new Error("No such listing");

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(rest)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(id, patch);

    // Approving something is the moment its numbers start being shown, so it
    // is also the moment they should be true.
    if (rest.status === "live" && (listing.repo || listing.npm)) {
      await ctx.scheduler.runAfter(0, internal.ingest.refreshOne, {
        slug: listing.slug,
      });
    }
    return { ok: true };
  },
});

export const removeListing = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const listing = await ctx.db.get(args.id);
    if (!listing) return { ok: true };

    // Components belong to their listing; leaving them behind would orphan
    // rows the render layer still tries to resolve.
    const owned = await ctx.db
      .query("components")
      .withIndex("by_listing", (q) => q.eq("listingSlug", listing.slug))
      .collect();
    for (const component of owned) await ctx.db.delete(component._id);

    await ctx.db.delete(args.id);
    return { ok: true, components: owned.length };
  },
});

/** Re-fetch a listing's facts on demand, rather than waiting for the cron. */
export const refetch = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    await ctx.scheduler.runAfter(0, internal.ingest.refreshOne, { slug: args.slug });
    return { ok: true };
  },
});

export const refetchAll = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    await ctx.scheduler.runAfter(0, internal.ingest.refreshAll, {});
    return { ok: true };
  },
});

/* ------------------------------------------------------------------ people */

export const members = query({
  args: { q: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const rows = await ctx.db.query("profiles").collect();
    const needle = args.q?.trim().toLowerCase();
    return rows
      .filter(
        (r) =>
          !needle ||
          r.handle.includes(needle) ||
          r.displayName.toLowerCase().includes(needle)
      )
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 200)
      .map((r) => ({
        id: r._id as string,
        handle: r.handle,
        displayName: r.displayName,
        role: r.role,
        plan: r.plan,
        createdAt: r.createdAt,
      }));
  },
});

export const setRole = mutation({
  args: {
    id: v.id("profiles"),
    role: v.union(v.literal("member"), v.literal("moderator"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(args.id);
    if (!target) throw new Error("No such member");

    const me = await getAuthUserId(ctx);
    if (target.userId === me && args.role !== "admin") {
      // Removing your own admin rights on a deployment where you are the only
      // admin locks the door with everyone outside it.
      const admins = await ctx.db.query("profiles").collect();
      if (admins.filter((p) => p.role === "admin").length <= 1) {
        throw new Error("You're the only admin — promote someone else first");
      }
    }

    await ctx.db.patch(args.id, { role: args.role });
    return { ok: true };
  },
});

export const setPlan = mutation({
  args: {
    id: v.id("profiles"),
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, {
      plan: args.plan,
      ...(args.plan === "pro" ? { proSince: Date.now() } : {}),
    });
    return { ok: true };
  },
});

/** Who am I, as far as this surface is concerned. */
export const me = query({
  args: {},
  handler: async (ctx): Promise<{ role: Role } | null> => {
    const role = await callerRole(ctx);
    if (role !== "admin" && role !== "moderator") return null;
    return { role };
  },
});
