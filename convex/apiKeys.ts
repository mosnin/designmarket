import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";

/**
 * API KEYS
 * ========
 * A key is shown exactly once, at creation, and only its SHA-256 is stored.
 * That means we cannot show it again, cannot email it, and cannot recover it
 * for someone who lost it — which is the point. What is stored is a prefix,
 * so a key can still be identified in a list without being reconstructible
 * from it.
 *
 * Generation happens in an action rather than a mutation: mutations are
 * deterministic and replayable, and a random secret generated inside one is a
 * secret that can be generated twice.
 */

const KEY_BYTES = 24;

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  return toHex(digest);
}

export const create = action({
  args: { label: v.optional(v.string()) },
  handler: async (
    ctx,
    args
  ): Promise<{ key: string; prefix: string; label: string }> => {
    const bytes = new Uint8Array(KEY_BYTES);
    crypto.getRandomValues(bytes);
    const key = `vtr_${toHex(bytes.buffer)}`;
    const hash = await hashKey(key);
    const label = args.label?.trim().slice(0, 60) || "Agent key";

    await ctx.runMutation(internal.apiKeys.store, {
      label,
      prefix: key.slice(0, 12),
      hash,
    });

    // The only time this value ever leaves the server.
    return { key, prefix: key.slice(0, 12), label };
  },
});

export const store = internalMutation({
  args: { label: v.string(), prefix: v.string(), hash: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile?.plan !== "pro") {
      throw new Error("API keys are part of the Pro plan");
    }

    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    if (existing.filter((k) => !k.revokedAt).length >= 10) {
      throw new Error("Ten active keys is the limit — revoke one first");
    }

    return ctx.db.insert("apiKeys", {
      userId,
      label: args.label,
      prefix: args.prefix,
      hash: args.hash,
      scopes: ["read"],
      createdAt: Date.now(),
      callCount: 0,
    });
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => ({
        id: row._id as string,
        label: row.label,
        prefix: row.prefix,
        scopes: row.scopes,
        createdAt: row.createdAt,
        lastUsedAt: row.lastUsedAt ?? null,
        revokedAt: row.revokedAt ?? null,
        callCount: row.callCount,
      }));
  },
});

/**
 * Revoked, never deleted. The row is what proves a key existed and what it
 * did, and the usage counter is the only way someone can tell a leaked key
 * from an unused one after the fact.
 */
export const revoke = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== userId) throw new Error("Not yours");
    if (row.revokedAt) return { ok: true };
    await ctx.db.patch(args.id, { revokedAt: Date.now() });
    return { ok: true };
  },
});

/* ------------------------------------------------- used by the MCP endpoint */

export const byHash = internalQuery({
  args: { hash: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("apiKeys")
      .withIndex("by_hash", (q) => q.eq("hash", args.hash))
      .unique();
    if (!row || row.revokedAt) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", row.userId))
      .unique();
    // A key outlives the subscription that justified it, so the plan is
    // checked on every call rather than only at creation.
    if (profile?.plan !== "pro") return null;

    return {
      id: row._id as string,
      userId: row.userId as string,
      handle: profile.handle,
      scopes: row.scopes,
    };
  },
});

export const recordUse = internalMutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id as Id<"apiKeys">);
    if (!row) return;
    await ctx.db.patch(row._id, {
      lastUsedAt: Date.now(),
      callCount: row.callCount + 1,
    });
  },
});
