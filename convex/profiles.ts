import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Profiles are separate from the `users` table that Convex Auth owns, so we can
 * add product fields — handle, plan, role — without fighting the auth schema
 * on upgrade.
 */

const RESERVED_HANDLES = new Set([
  "admin", "api", "me", "new", "settings", "submit", "explore", "components",
  "libraries", "tools", "stacks", "drop", "compare", "pricing", "mcp",
  "signin", "signup", "signout", "about", "docs", "blog", "help", "support",
  "vitrine", "root", "system", "moderator", "staff",
]);

function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 24);
}

async function uniqueHandle(ctx: MutationCtx, base: string): Promise<string> {
  const root = slugifyHandle(base) || "member";
  const candidate = RESERVED_HANDLES.has(root) ? `${root}-1` : root;

  for (let attempt = 0; attempt < 50; attempt++) {
    const handle = attempt === 0 ? candidate : `${candidate}-${attempt + 1}`;
    const taken = await ctx.db
      .query("profiles")
      .withIndex("by_handle", (q) => q.eq("handle", handle))
      .unique();
    if (!taken) return handle;
  }
  // Fall back to something that cannot collide.
  return `${candidate}-${Date.now().toString(36)}`;
}

/**
 * Creates the profile for a newly created auth user.
 *
 * The very first account on a deployment becomes `admin` — someone has to be
 * able to reach `/admin` on a fresh install, and the alternative is a seeded
 * password sitting in a config file.
 */
export const ensureForUser = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (existing) return existing._id;

    const user = await ctx.db.get(args.userId);
    const anyProfile = await ctx.db.query("profiles").first();

    const base =
      (user?.name as string | undefined) ??
      (user?.email as string | undefined)?.split("@")[0] ??
      "member";

    return ctx.db.insert("profiles", {
      userId: args.userId,
      handle: await uniqueHandle(ctx, base),
      displayName: (user?.name as string | undefined) ?? base,
      ...(user?.image ? { avatarUrl: user.image as string } : {}),
      plan: "free",
      role: anyProfile === null ? "admin" : "member",
      createdAt: Date.now(),
    });
  },
});

export type Viewer = {
  userId: string;
  handle: string;
  displayName: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
  email?: string;
  plan: "free" | "pro";
  role: "member" | "moderator" | "admin";
  createdAt: number;
};

async function loadViewer(ctx: QueryCtx, userId: Id<"users">): Promise<Viewer | null> {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!profile) return null;
  const user = await ctx.db.get(userId);
  return {
    userId,
    handle: profile.handle,
    displayName: profile.displayName,
    ...(profile.bio ? { bio: profile.bio } : {}),
    ...(profile.website ? { website: profile.website } : {}),
    ...(profile.avatarUrl ? { avatarUrl: profile.avatarUrl } : {}),
    ...(user?.email ? { email: user.email as string } : {}),
    plan: profile.plan,
    role: profile.role,
    createdAt: profile.createdAt,
  };
}

/** The signed-in user, or null. Safe to call logged out. */
export const viewer = query({
  args: {},
  handler: async (ctx): Promise<Viewer | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return loadViewer(ctx, userId);
  },
});

export const byHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!profile) return null;
    return {
      handle: profile.handle,
      displayName: profile.displayName,
      bio: profile.bio,
      website: profile.website,
      avatarUrl: profile.avatarUrl,
      plan: profile.plan,
      createdAt: profile.createdAt,
    };
  },
});

export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    handle: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("No profile");

    const patch: Record<string, string> = {};

    if (args.handle && args.handle !== profile.handle) {
      const wanted = slugifyHandle(args.handle);
      if (wanted.length < 2) throw new Error("Handle is too short");
      if (RESERVED_HANDLES.has(wanted)) throw new Error("That handle is reserved");
      const taken = await ctx.db
        .query("profiles")
        .withIndex("by_handle", (q) => q.eq("handle", wanted))
        .unique();
      if (taken) throw new Error("That handle is taken");
      patch.handle = wanted;
    }
    if (args.displayName !== undefined) {
      patch.displayName = args.displayName.trim().slice(0, 60) || profile.displayName;
    }
    if (args.bio !== undefined) patch.bio = args.bio.trim().slice(0, 280);
    if (args.website !== undefined) patch.website = args.website.trim().slice(0, 200);

    await ctx.db.patch(profile._id, patch);
    return { ok: true };
  },
});

/* --------------------------------------------------------------- authorization */

export async function requireViewer(ctx: QueryCtx): Promise<Viewer> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not signed in");
  const viewerDoc = await loadViewer(ctx, userId);
  if (!viewerDoc) throw new Error("No profile");
  return viewerDoc;
}

export async function requireRole(
  ctx: QueryCtx,
  roles: ("moderator" | "admin")[]
): Promise<Viewer> {
  const v = await requireViewer(ctx);
  if (!roles.includes(v.role as "moderator" | "admin")) {
    throw new Error("Not authorized");
  }
  return v;
}

/**
 * Everything a public profile page needs, in one round trip.
 *
 * A profile is only worth visiting if it shows what someone actually
 * contributed, so it joins the live listings they submitted and the boards
 * they chose to make public. Private boards never appear here, and there is no
 * argument to ask for them — the query cannot return them at all.
 */
export const publicProfile = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_handle", (q) => q.eq("handle", args.handle))
      .unique();
    if (!profile) return null;

    const [submitted, owned] = await Promise.all([
      ctx.db
        .query("listings")
        .withIndex("by_submitter", (q) => q.eq("submittedBy", profile.userId))
        .collect(),
      ctx.db
        .query("collections")
        .withIndex("by_owner", (q) => q.eq("ownerId", profile.userId))
        .collect(),
    ]);

    return {
      handle: profile.handle,
      displayName: profile.displayName,
      bio: profile.bio ?? null,
      website: profile.website ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      plan: profile.plan,
      createdAt: profile.createdAt,
      listings: submitted
        .filter((l) => l.status === "live")
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((l) => ({
          slug: l.slug,
          name: l.name,
          tagline: l.tagline,
          kind: l.kind,
          color: l.color,
          monogram: l.monogram,
        })),
      boards: owned
        .filter((c) => c.kind === "board" && c.visibility === "public")
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((c) => ({
          slug: c.slug,
          name: c.name,
          description: c.description,
          itemCount: c.items.length,
          updatedAt: c.updatedAt,
        })),
    };
  },
});
