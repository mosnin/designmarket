import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";

/**
 * REMIXES
 *
 * A remix is a saved configuration of someone else's component: the props you
 * landed on, and the tokens you were viewing it in. It deliberately does not
 * copy the component's code — you are saving your decision, not forking their
 * work, and the remix keeps pointing at the original so it stays credited and
 * stays current.
 */

export const save = mutation({
  args: {
    componentSlug: v.string(),
    name: v.string(),
    props: v.any(),
    tokens: v.optional(v.any()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to save a remix");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("No profile");

    const name = args.name.trim().slice(0, 80) || "Untitled remix";
    const now = Date.now();

    // Saving the same component twice under the same name updates rather than
    // piling up near-identical rows.
    const existing = await ctx.db
      .query("remixes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const match = existing.find(
      (r) => r.componentSlug === args.componentSlug && r.name === name
    );

    if (match) {
      await ctx.db.patch(match._id, {
        props: args.props,
        ...(args.tokens ? { tokens: args.tokens } : {}),
        updatedAt: now,
      });
      return { id: match._id, updated: true };
    }

    const id = await ctx.db.insert("remixes", {
      userId,
      ownerHandle: profile.handle,
      componentSlug: args.componentSlug,
      name,
      props: args.props,
      ...(args.tokens ? { tokens: args.tokens } : {}),
      visibility: args.visibility ?? "private",
      createdAt: now,
      updatedAt: now,
    });
    return { id, updated: false };
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("remixes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((r) => ({
        id: r._id,
        componentSlug: r.componentSlug,
        name: r.name,
        props: r.props as Record<string, unknown>,
        visibility: r.visibility,
        updatedAt: r.updatedAt,
      }));
  },
});

export const remove = mutation({
  args: { id: v.id("remixes") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const row = await ctx.db.get(args.id);
    if (!row) return { ok: true };
    if (row.userId !== userId) throw new Error("Not yours to delete");
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

export const forComponent = query({
  args: { componentSlug: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("remixes")
      .withIndex("by_component", (q) => q.eq("componentSlug", args.componentSlug))
      .collect();
    return rows
      .filter((r) => r.visibility === "public")
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 12)
      .map((r) => ({
        id: r._id,
        name: r.name,
        ownerHandle: r.ownerHandle,
        props: r.props as Record<string, unknown>,
      }));
  },
});
