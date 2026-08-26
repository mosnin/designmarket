import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

/**
 * Convex schema.
 *
 * Two shapes deserve a note:
 *
 * 1. `listingCategories` / `componentTags` exist because Convex indexes scalar
 *    fields, not array membership. Category pages are the hottest read path in
 *    the app, so they get a real join table with an index rather than a full
 *    scan and an in-memory filter.
 *
 * 2. `components` is a first-class table, not a sub-document of `listings`.
 *    Browsing individual components across every library is the product, so
 *    they need their own indexes, their own search index, and their own
 *    counters.
 */

const stackProfile = v.object({
  frameworks: v.array(v.string()),
  styling: v.array(v.string()),
  react: v.string(),
  rsc: v.string(),
  typescript: v.boolean(),
  a11y: v.string(),
  install: v.array(v.string()),
});

const listingFacts = v.object({
  githubStars: v.optional(v.number()),
  weeklyDownloads: v.optional(v.number()),
  bundleBytes: v.optional(v.number()),
  dependencies: v.optional(v.number()),
  lastCommit: v.optional(v.number()),
  version: v.optional(v.string()),
  firstRelease: v.optional(v.number()),
  hasDocs: v.optional(v.boolean()),
  contributors: v.optional(v.number()),
});

const componentProp = v.object({
  name: v.string(),
  type: v.union(
    v.literal("enum"),
    v.literal("boolean"),
    v.literal("string"),
    v.literal("number")
  ),
  options: v.optional(v.array(v.string())),
  defaultValue: v.optional(
    v.union(v.string(), v.boolean(), v.number())
  ),
  description: v.optional(v.string()),
});

export default defineSchema({
  ...authTables,

  profiles: defineTable({
    userId: v.id("users"),
    handle: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro")),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    proSince: v.optional(v.number()),
    role: v.union(v.literal("member"), v.literal("moderator"), v.literal("admin")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_handle", ["handle"])
    .index("by_stripe_customer", ["stripeCustomerId"]),

  listings: defineTable({
    kind: v.union(v.literal("library"), v.literal("tool"), v.literal("resource")),
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    description: v.string(),
    categories: v.array(v.string()),
    tags: v.array(v.string()),
    homepage: v.optional(v.string()),
    repo: v.optional(v.string()),
    npm: v.optional(v.string()),
    docs: v.optional(v.string()),
    license: v.string(),
    licenseBucket: v.string(),
    pricing: v.string(),
    priceNote: v.optional(v.string()),
    stack: stackProfile,
    facts: listingFacts,
    componentCount: v.number(),
    color: v.string(),
    monogram: v.string(),
    featured: v.boolean(),
    verified: v.boolean(),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("live"),
      v.literal("rejected")
    ),
    submittedBy: v.optional(v.id("users")),
    submittedByHandle: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    views: v.number(),
    saves: v.number(),
    votes: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_kind", ["status", "kind"])
    .index("by_status_votes", ["status", "votes"])
    .index("by_status_created", ["status", "createdAt"])
    .index("by_submitter", ["submittedBy"])
    .searchIndex("search_listings", {
      searchField: "name",
      filterFields: ["status", "kind"],
    })
    .searchIndex("search_listing_text", {
      searchField: "description",
      filterFields: ["status", "kind"],
    }),

  /** Join table — Convex indexes scalars, not array membership. */
  listingCategories: defineTable({
    listingId: v.id("listings"),
    listingSlug: v.string(),
    category: v.string(),
    kind: v.string(),
    status: v.string(),
  })
    .index("by_category", ["category", "status"])
    .index("by_listing", ["listingId"]),

  components: defineTable({
    listingId: v.id("listings"),
    listingSlug: v.string(),
    slug: v.string(),
    name: v.string(),
    kind: v.string(),
    description: v.string(),
    previewMode: v.union(
      v.literal("registry"),
      v.literal("compiled"),
      v.literal("static")
    ),
    registryKey: v.optional(v.string()),
    source: v.optional(v.string()),
    installCommand: v.optional(v.string()),
    importLine: v.optional(v.string()),
    props: v.array(componentProp),
    deps: v.array(v.string()),
    a11yNotes: v.optional(v.string()),
    tags: v.array(v.string()),
    featured: v.boolean(),
    canvasHeight: v.optional(v.number()),
    gridBackdrop: v.optional(v.boolean()),
    status: v.string(),
    ownerId: v.optional(v.id("users")),
    createdAt: v.number(),
    views: v.number(),
    saves: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_listing", ["listingSlug"])
    .index("by_kind", ["kind", "status"])
    .index("by_status_created", ["status", "createdAt"])
    .searchIndex("search_components", {
      searchField: "name",
      filterFields: ["status", "kind", "listingSlug"],
    }),

  collections: defineTable({
    kind: v.union(v.literal("stack"), v.literal("board")),
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    ownerId: v.optional(v.id("users")),
    ownerHandle: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    curated: v.boolean(),
    items: v.array(
      v.object({
        type: v.union(v.literal("listing"), v.literal("component")),
        slug: v.string(),
        note: v.optional(v.string()),
      })
    ),
    color: v.string(),
    saves: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_kind_visibility", ["kind", "visibility"]),

  bookmarks: defineTable({
    userId: v.id("users"),
    targetType: v.union(
      v.literal("listing"),
      v.literal("component"),
      v.literal("collection")
    ),
    targetSlug: v.string(),
    boardId: v.optional(v.id("collections")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_target", ["userId", "targetType", "targetSlug"])
    .index("by_target", ["targetType", "targetSlug"]),

  votes: defineTable({
    userId: v.id("users"),
    listingSlug: v.string(),
    createdAt: v.number(),
  })
    .index("by_user_listing", ["userId", "listingSlug"])
    .index("by_listing", ["listingSlug"]),

  reviews: defineTable({
    userId: v.id("users"),
    authorHandle: v.string(),
    listingSlug: v.string(),
    rating: v.number(),
    title: v.optional(v.string()),
    body: v.string(),
    /** what they actually built with it — keeps reviews concrete */
    usedFor: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_listing", ["listingSlug"])
    .index("by_user_listing", ["userId", "listingSlug"]),

  remixes: defineTable({
    userId: v.id("users"),
    ownerHandle: v.string(),
    componentSlug: v.string(),
    name: v.string(),
    props: v.any(),
    sourceOverride: v.optional(v.string()),
    tokens: v.optional(v.any()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_component", ["componentSlug"]),

  apiKeys: defineTable({
    userId: v.id("users"),
    label: v.string(),
    /** first 12 chars, shown in the UI so a key can be identified after creation */
    prefix: v.string(),
    /** SHA-256 of the full key; the plaintext is shown exactly once */
    hash: v.string(),
    scopes: v.array(v.string()),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    callCount: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_hash", ["hash"]),

  submissions: defineTable({
    userId: v.id("users"),
    submitterHandle: v.string(),
    kind: v.string(),
    payload: v.any(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("changes-requested")
    ),
    moderatorNote: v.optional(v.string()),
    listingSlug: v.optional(v.string()),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status", "createdAt"]),

  drops: defineTable({
    date: v.string(),
    headline: v.string(),
    note: v.string(),
    listingSlugs: v.array(v.string()),
    componentSlugs: v.array(v.string()),
  }).index("by_date", ["date"]),

  /** Coarse analytics — powers "trending" without leaning on votes. */
  events: defineTable({
    type: v.string(),
    targetType: v.string(),
    targetSlug: v.string(),
    at: v.number(),
    userId: v.optional(v.id("users")),
  })
    .index("by_target", ["targetType", "targetSlug", "at"])
    .index("by_type_at", ["type", "at"]),
});
