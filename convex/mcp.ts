import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";
import { buildAgentManifest, buildInstallPlan } from "../lib/install-plan";
import type { Collection, Listing, UIComponent } from "../lib/types";
import { queryListings } from "../lib/query-engine";
import { computeShipScore } from "../lib/ship-score";

/**
 * THE AGENT-FACING INDEX
 * ======================
 * Everything here answers the question a coding agent actually has, which is
 * never "what is popular" but "what can I install into *this* project without
 * breaking it".
 *
 * So the tools are shaped around constraints rather than around browsing:
 * a search takes a stack profile, an install plan resolves to commands, and
 * the compatibility check returns conflicts rather than a score. An agent that
 * gets a ranked list back still has to go and read six READMEs; one that gets
 * "these three work with React 19 and this one doesn't" can act.
 *
 * The data is the same data the website renders — same query engine, same
 * install-plan builder, same Ship Score. An agent and a reader never get
 * different answers about the same listing.
 */

function toListing(doc: Doc<"listings">): Listing {
  return {
    _id: doc._id as string,
    kind: doc.kind,
    slug: doc.slug,
    name: doc.name,
    tagline: doc.tagline,
    description: doc.description,
    categories: doc.categories,
    tags: doc.tags,
    ...(doc.homepage ? { homepage: doc.homepage } : {}),
    ...(doc.repo ? { repo: doc.repo } : {}),
    ...(doc.npm ? { npm: doc.npm } : {}),
    ...(doc.docs ? { docs: doc.docs } : {}),
    license: doc.license,
    licenseBucket: doc.licenseBucket,
    pricing: doc.pricing,
    ...(doc.priceNote ? { priceNote: doc.priceNote } : {}),
    stack: doc.stack,
    facts: doc.facts,
    componentCount: doc.componentCount,
    ...(doc.details ? { details: doc.details as Listing["details"] } : {}),
    color: doc.color,
    monogram: doc.monogram,
    featured: doc.featured,
    verified: doc.verified,
    status: doc.status,
    ...(doc.submittedByHandle ? { submittedByHandle: doc.submittedByHandle } : {}),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    views: doc.views,
    saves: doc.saves,
    votes: doc.votes,
  };
}

function toComponent(doc: Doc<"components">): UIComponent {
  return {
    _id: doc._id as string,
    listingSlug: doc.listingSlug,
    slug: doc.slug,
    name: doc.name,
    kind: doc.kind,
    description: doc.description,
    previewMode: doc.previewMode,
    ...(doc.registryKey ? { registryKey: doc.registryKey } : {}),
    ...(doc.source ? { source: doc.source } : {}),
    ...(doc.installCommand ? { installCommand: doc.installCommand } : {}),
    ...(doc.importLine ? { importLine: doc.importLine } : {}),
    props: doc.props as UIComponent["props"],
    deps: doc.deps,
    ...(doc.a11yNotes ? { a11yNotes: doc.a11yNotes } : {}),
    tags: doc.tags,
    featured: doc.featured,
    ...(doc.canvasHeight ? { canvasHeight: doc.canvasHeight } : {}),
    ...(doc.gridBackdrop ? { gridBackdrop: doc.gridBackdrop } : {}),
    createdAt: doc.createdAt,
    views: doc.views,
    saves: doc.saves,
  };
}

/** The shape an agent gets back from a search — small, and every field acted on. */
function digest(listing: Listing): Record<string, unknown> {
  const score = computeShipScore(listing);
  const out: Record<string, unknown> = {
    slug: listing.slug,
    name: listing.name,
    kind: listing.kind,
    summary: listing.tagline,
    license: listing.license,
    pricing: listing.pricing,
    shipScore: score.provisional ? null : score.score,
    requires: {
      react: listing.stack.react,
      rsc: listing.stack.rsc,
      frameworks: listing.stack.frameworks,
      styling: listing.stack.styling,
    },
    install: listing.stack.install,
  };
  if (listing.npm) out.package = listing.npm;
  if (listing.repo) out.repo = listing.repo;
  if (listing.docs) out.docs = listing.docs;
  if (listing.componentCount) out.componentsIndexed = listing.componentCount;
  if (listing.facts.weeklyDownloads) out.weeklyDownloads = listing.facts.weeklyDownloads;
  if (listing.facts.version) out.version = listing.facts.version;
  return out;
}

export const search = internalQuery({
  args: {
    q: v.optional(v.string()),
    kind: v.optional(v.string()),
    category: v.optional(v.string()),
    react: v.optional(v.string()),
    styling: v.optional(v.string()),
    license: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "live"))
      .collect();

    const facets: Record<string, string[]> = {};
    if (args.styling) facets.styling = [args.styling];
    if (args.license) facets.license = [args.license];

    const page = queryListings(docs.map(toListing), {
      ...(args.q ? { q: args.q } : {}),
      ...(args.kind ? { kind: args.kind as Listing["kind"] } : {}),
      ...(args.category ? { category: args.category } : {}),
      ...(Object.keys(facets).length ? { facets } : {}),
      sort: "ship-score",
      limit: Math.min(args.limit ?? 12, 40),
    });

    // React version is a hard constraint, not a ranking signal: a library that
    // needs 19 is not "slightly less relevant" to an 18 project, it is wrong.
    const items = args.react
      ? page.items.filter(
          (l) => l.stack.react === "any" || l.stack.react === args.react
        )
      : page.items;

    return {
      total: items.length,
      results: items.map(digest),
    };
  },
});

export const listing = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("listings")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!doc || doc.status !== "live") return null;

    const listing_ = toListing(doc);
    const score = computeShipScore(listing_);
    const components = await ctx.db
      .query("components")
      .withIndex("by_listing", (q) => q.eq("listingSlug", doc.slug))
      .collect();

    return {
      ...digest(listing_),
      description: listing_.description,
      categories: listing_.categories,
      facts: listing_.facts,
      details: listing_.details ?? null,
      shipScore: {
        score: score.score,
        grade: score.grade,
        provisional: score.provisional,
        // The breakdown, not just the number — an agent choosing between two
        // libraries needs to know *which* dimension is weak.
        dimensions: score.dimensions.map((d) => ({
          id: d.id,
          points: d.points,
          max: d.max,
          evidence: d.note,
        })),
      },
      components: components.map((c) => ({
        slug: c.slug,
        name: c.name,
        kind: c.kind,
        renderable: c.previewMode !== "static",
      })),
    };
  },
});

export const component = internalQuery({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("components")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!doc) return null;
    const c = toComponent(doc);
    return {
      slug: c.slug,
      name: c.name,
      kind: c.kind,
      description: c.description,
      from: c.listingSlug,
      usage: c.source ?? null,
      install: c.installCommand ?? null,
      import: c.importLine ?? null,
      props: c.props,
      deps: c.deps,
      accessibility: c.a11yNotes ?? null,
    };
  },
});

export const plan = internalQuery({
  args: { slugs: v.array(v.string()), name: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const found = await Promise.all(
      args.slugs.slice(0, 40).map(async (slug) => {
        const doc = await ctx.db
          .query("listings")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();
        return doc && doc.status === "live" ? toListing(doc) : null;
      })
    );
    const listings = found.filter((l): l is Listing => l !== null);
    const missing = args.slugs.filter((s) => !listings.some((l) => l.slug === s));

    // A synthetic collection, so the manifest an agent gets from a loose set of
    // slugs is byte-identical to the one it gets for a curated stack.
    const collection: Collection = {
      _id: "adhoc",
      kind: "stack",
      slug: "adhoc",
      name: args.name ?? "Ad-hoc stack",
      description: "Assembled from the slugs requested.",
      visibility: "public",
      curated: false,
      items: listings.map((l) => ({ type: "listing" as const, slug: l.slug })),
      color: "#2563eb",
      saves: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const built = buildInstallPlan(listings, []);
    return {
      ...buildAgentManifest(collection, listings, []),
      covered: built.covered,
      // Never silently drop a slug an agent asked about.
      unknown: missing,
    };
  },
});

/**
 * Conflicts, not a score.
 *
 * "These are 78% compatible" is unactionable. What an agent can act on is
 * "radix needs React 19 and your project is on 18", so every finding names the
 * two things that disagree and what disagrees about them.
 */
export const compatibility = internalQuery({
  args: {
    slugs: v.array(v.string()),
    react: v.optional(v.string()),
    styling: v.optional(v.string()),
    rsc: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const found = await Promise.all(
      args.slugs.slice(0, 40).map(async (slug) => {
        const doc = await ctx.db
          .query("listings")
          .withIndex("by_slug", (q) => q.eq("slug", slug))
          .unique();
        return doc && doc.status === "live" ? toListing(doc) : null;
      })
    );
    const listings = found.filter((l): l is Listing => l !== null);
    const conflicts: { severity: string; between: string[]; issue: string }[] = [];

    if (args.react) {
      for (const l of listings) {
        if (l.stack.react !== "any" && l.stack.react !== args.react) {
          conflicts.push({
            severity: "blocking",
            between: [l.slug, `your project (React ${args.react})`],
            issue: `${l.name} requires React ${l.stack.react}`,
          });
        }
      }
    }

    if (args.rsc) {
      for (const l of listings) {
        if (l.stack.rsc === "client") {
          conflicts.push({
            severity: "warning",
            between: [l.slug, "your project (Server Components)"],
            issue: `${l.name} is client-only — it needs a "use client" boundary`,
          });
        } else if (l.stack.rsc === "unknown") {
          conflicts.push({
            severity: "unknown",
            between: [l.slug, "your project (Server Components)"],
            issue: `${l.name} doesn't declare whether it is RSC-safe`,
          });
        }
      }
    }

    if (args.styling) {
      for (const l of listings) {
        if (l.stack.styling.length && !l.stack.styling.includes(args.styling)) {
          conflicts.push({
            severity: "friction",
            between: [l.slug, `your project (${args.styling})`],
            issue: `${l.name} ships ${l.stack.styling.join(" / ")} — you'd be running two styling systems`,
          });
        }
      }
    }

    // Copyleft is the licence question that actually stops a shipment.
    for (const l of listings) {
      if (l.licenseBucket === "gpl") {
        conflicts.push({
          severity: "legal",
          between: [l.slug, "your project"],
          issue: `${l.name} is ${l.license} — copyleft, check before shipping commercially`,
        });
      }
    }

    return {
      checked: listings.map((l) => l.slug),
      unknown: args.slugs.filter((s) => !listings.some((l) => l.slug === s)),
      compatible: conflicts.filter((c) => c.severity === "blocking").length === 0,
      conflicts,
    };
  },
});
