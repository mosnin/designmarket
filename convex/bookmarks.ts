import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc } from "./_generated/dataModel";
import { mutation, query, type QueryCtx } from "./_generated/server";

/**
 * BOOKMARKS AND BOARDS
 *
 * A bookmark with no board is the quick save — one tap, decide later. A board
 * is the same bookmark filed somewhere. Keeping them one table rather than two
 * means "save it" never has to ask "where?", and organising later never has to
 * re-save anything.
 */

const targetType = v.union(
  v.literal("listing"),
  v.literal("component"),
  v.literal("collection")
);

export const toggle = mutation({
  args: {
    targetType,
    targetSlug: v.string(),
    boardId: v.optional(v.id("collections")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to save things");

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_target", (q) =>
        q
          .eq("userId", userId)
          .eq("targetType", args.targetType)
          .eq("targetSlug", args.targetSlug)
      )
      .unique();

    if (existing) {
      // Saving into a board something you already saved loose files it rather
      // than removing it — the second tap should never lose the save.
      if (args.boardId && existing.boardId !== args.boardId) {
        await ctx.db.patch(existing._id, { boardId: args.boardId });
        return { saved: true, filed: true };
      }
      await ctx.db.delete(existing._id);
      return { saved: false, filed: false };
    }

    await ctx.db.insert("bookmarks", {
      userId,
      targetType: args.targetType,
      targetSlug: args.targetSlug,
      ...(args.boardId ? { boardId: args.boardId } : {}),
      createdAt: Date.now(),
    });
    return { saved: true, filed: Boolean(args.boardId) };
  },
});

export const mine = query({
  args: { targetType: v.optional(targetType) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows
      .filter((r) => !args.targetType || r.targetType === args.targetType)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((r) => ({
        id: r._id,
        targetType: r.targetType,
        targetSlug: r.targetSlug,
        boardId: r.boardId ?? null,
        createdAt: r.createdAt,
      }));
  },
});

/** Just the slugs, for rendering "saved" state across a whole grid cheaply. */
export const mineSlugs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return rows.map((r) => `${r.targetType}:${r.targetSlug}`);
  },
});

/* ----------------------------------------------------------------- boards */

export const createBoard = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("No profile");

    const name = args.name.trim().slice(0, 80) || "Untitled board";
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

    // Board slugs are namespaced by handle, so two people can both have a
    // board called "dashboard rebuild".
    let slug = `${profile.handle}-${base || "board"}`;
    for (let attempt = 1; attempt < 40; attempt++) {
      const taken = await ctx.db
        .query("collections")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!taken) break;
      slug = `${profile.handle}-${base}-${attempt + 1}`;
    }

    const now = Date.now();
    return ctx.db.insert("collections", {
      kind: "board",
      slug,
      name,
      description: args.description?.trim().slice(0, 280) ?? "",
      ownerId: userId,
      ownerHandle: profile.handle,
      visibility: args.visibility ?? "private",
      curated: false,
      items: [],
      color: "#0066ff",
      saves: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const myBoards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("collections")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
    return rows
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((r) => ({
        id: r._id,
        slug: r.slug,
        name: r.name,
        description: r.description,
        visibility: r.visibility,
        itemCount: r.items.length,
        updatedAt: r.updatedAt,
      }));
  },
});

export const addToBoard = mutation({
  args: {
    boardId: v.id("collections"),
    type: v.union(v.literal("listing"), v.literal("component")),
    slug: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const board = await ctx.db.get(args.boardId);
    if (!board) throw new Error("No such board");
    if (board.ownerId !== userId) throw new Error("Not your board");

    if (board.items.some((i) => i.slug === args.slug && i.type === args.type)) {
      return { added: false };
    }
    await ctx.db.patch(args.boardId, {
      items: [
        ...board.items,
        {
          type: args.type,
          slug: args.slug,
          ...(args.note ? { note: args.note } : {}),
        },
      ],
      updatedAt: Date.now(),
    });
    return { added: true };
  },
});

export const removeFromBoard = mutation({
  args: { boardId: v.id("collections"), slug: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const board = await ctx.db.get(args.boardId);
    if (!board || board.ownerId !== userId) throw new Error("Not your board");
    await ctx.db.patch(args.boardId, {
      items: board.items.filter((i) => i.slug !== args.slug),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

/* ------------------------------------------------- hydrated, for the UI */

export type SavedItem = {
  id: string;
  targetType: "listing" | "component" | "collection";
  slug: string;
  name: string;
  subtitle: string;
  kind: string;
  color: string;
  monogram: string;
  boardId: string | null;
  createdAt: number;
  /** the row is gone from the catalogue — we say so instead of dropping it */
  missing?: boolean;
};

/**
 * Bookmarks are stored as slugs, not ids, so a save survives a listing being
 * re-ingested. That means the list has to be joined at read time — and it
 * means a save can outlive the thing it points at. Rather than silently
 * dropping those rows, they come back flagged `missing` so the UI can say
 * what happened and offer to clear it.
 */
async function hydrate(ctx: QueryCtx, row: Doc<"bookmarks">): Promise<SavedItem> {
  const base = {
    id: row._id as string,
    targetType: row.targetType,
    slug: row.targetSlug,
    boardId: (row.boardId as string | undefined) ?? null,
    createdAt: row.createdAt,
  };

  if (row.targetType === "listing") {
    const listing = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", row.targetSlug))
      .unique();
    if (!listing) {
      return { ...base, name: row.targetSlug, subtitle: "No longer listed", kind: "listing", color: "#6b7280", monogram: "?", missing: true };
    }
    return {
      ...base,
      name: listing.name,
      subtitle: listing.tagline,
      kind: listing.kind,
      color: listing.color,
      monogram: listing.monogram,
    };
  }

  if (row.targetType === "component") {
    const component = await ctx.db
      .query("components")
      .withIndex("by_slug", (q) => q.eq("slug", row.targetSlug))
      .unique();
    if (!component) {
      return { ...base, name: row.targetSlug, subtitle: "No longer listed", kind: "component", color: "#6b7280", monogram: "?", missing: true };
    }
    const parent = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", component.listingSlug))
      .unique();
    return {
      ...base,
      name: component.name,
      subtitle: parent ? `${component.kind} · ${parent.name}` : component.kind,
      kind: "component",
      color: parent?.color ?? "#6b7280",
      monogram: parent?.monogram ?? component.name.slice(0, 2).toUpperCase(),
    };
  }

  const collection = await ctx.db
    .query("collections")
    .withIndex("by_slug", (q) => q.eq("slug", row.targetSlug))
    .unique();
  if (!collection) {
    return { ...base, name: row.targetSlug, subtitle: "No longer listed", kind: "stack", color: "#6b7280", monogram: "?", missing: true };
  }
  return {
    ...base,
    name: collection.name,
    subtitle: `${collection.items.length} items`,
    kind: collection.kind,
    color: collection.color,
    monogram: collection.name.slice(0, 2).toUpperCase(),
  };
}

export const saved = query({
  args: { boardId: v.optional(v.id("collections")) },
  handler: async (ctx, args): Promise<SavedItem[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const filtered = args.boardId
      ? rows.filter((r) => r.boardId === args.boardId)
      : rows;
    filtered.sort((a, b) => b.createdAt - a.createdAt);
    return Promise.all(filtered.map((row) => hydrate(ctx, row)));
  },
});

export const removeSaved = mutation({
  args: { id: v.id("bookmarks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== userId) throw new Error("Not yours");
    await ctx.db.delete(args.id);
    return { ok: true };
  },
});

/** Move a save between boards — or back to the loose pile with `null`. */
export const fileInto = mutation({
  args: { id: v.id("bookmarks"), boardId: v.union(v.id("collections"), v.null()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const row = await ctx.db.get(args.id);
    if (!row || row.userId !== userId) throw new Error("Not yours");
    if (args.boardId) {
      const board = await ctx.db.get(args.boardId);
      if (!board || board.ownerId !== userId) throw new Error("Not your board");
    }
    await ctx.db.patch(args.id, { boardId: args.boardId ?? undefined });
    return { ok: true };
  },
});

export const renameBoard = mutation({
  args: {
    boardId: v.id("collections"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const board = await ctx.db.get(args.boardId);
    if (!board || board.ownerId !== userId) throw new Error("Not your board");
    await ctx.db.patch(args.boardId, {
      ...(args.name ? { name: args.name.trim().slice(0, 80) } : {}),
      ...(args.description !== undefined
        ? { description: args.description.trim().slice(0, 280) }
        : {}),
      ...(args.visibility ? { visibility: args.visibility } : {}),
      updatedAt: Date.now(),
    });
    return { ok: true };
  },
});

export const deleteBoard = mutation({
  args: { boardId: v.id("collections") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in first");
    const board = await ctx.db.get(args.boardId);
    if (!board || board.ownerId !== userId) throw new Error("Not your board");

    // Deleting a board unfiles its saves rather than destroying them. Losing a
    // shelf should never mean losing the books on it.
    const filed = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const row of filed) {
      if (row.boardId === args.boardId) {
        await ctx.db.patch(row._id, { boardId: undefined });
      }
    }
    await ctx.db.delete(args.boardId);
    return { ok: true };
  },
});
