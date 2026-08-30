import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action, mutation, query, type QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * SUBMISSION
 * ==========
 * Every other directory's submit form is twenty empty fields and a promise
 * that a human will look at it eventually. Ours asks for one thing — a URL —
 * and then goes and reads the project: GitHub for the repo, the npm registry
 * for the package, the package manifest for what it actually depends on.
 *
 * Two consequences follow, and both are the point:
 *
 *  1. Nothing in the draft is typed by the submitter, so nothing in it is a
 *     marketing claim. If we could not verify a field it comes back empty and
 *     stays empty — the reviewer sees the gap rather than a confident guess.
 *
 *  2. The submitter sees their Ship Score, with the working, before they
 *     submit. A directory that grades listings owes people the grade up front,
 *     including the parts they can still go and fix.
 */

/* --------------------------------------------------------------- inspect */

export type ImportDraft = {
  /** what we resolved the URL to */
  source: { repo?: string; npm?: string; homepage?: string };
  name: string;
  slug: string;
  tagline: string;
  description: string;
  license: string;
  licenseBucket: string;
  tags: string[];
  monogram: string;
  repo?: string;
  npm?: string;
  docs?: string;
  homepage?: string;
  stack: {
    frameworks: string[];
    styling: string[];
    react: string;
    rsc: string;
    typescript: boolean;
    a11y: string;
    install: string[];
  };
  facts: Record<string, number | string | boolean>;
  /** fields we looked for and could not confirm — shown, not hidden */
  unresolved: string[];
};

type Json = Record<string, unknown> | null;

async function getJson(url: string, headers: Record<string, string> = {}): Promise<Json> {
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "vitrine-import", ...headers },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as Json;
  } catch {
    return null;
  }
}

function parseGitHub(input: string): string | null {
  const match = /github\.com\/([^/\s]+)\/([^/\s#?]+)/.exec(input);
  if (!match) return null;
  return `${match[1]}/${match[2]!.replace(/\.git$/, "")}`;
}

function parseNpm(input: string): string | null {
  const scoped = /npmjs\.com\/package\/(@[^/\s]+\/[^/\s#?]+)/.exec(input);
  if (scoped) return scoped[1]!;
  const plain = /npmjs\.com\/package\/([^/\s#?]+)/.exec(input);
  if (plain) return plain[1]!;
  // A bare package name is a legitimate thing to paste.
  if (/^@?[a-z0-9][a-z0-9._/-]*$/i.test(input.trim()) && !input.includes(".")) {
    return input.trim();
  }
  return null;
}

function licenseBucket(license: string): string {
  const value = license.toLowerCase();
  if (value.startsWith("mit")) return "mit";
  if (value.startsWith("apache")) return "apache-2.0";
  if (value.startsWith("bsd")) return "bsd-3";
  if (value.includes("gpl")) return "gpl";
  return "commercial";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function monogramOf(name: string): string {
  const words = name.replace(/^@[^/]+\//, "").split(/[\s\-_./]+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return (words[0] ?? name).slice(0, 2).toUpperCase();
}

/** Read a semver range for React and say only what it actually allows. */
function reactRange(range: string | undefined): string {
  if (!range) return "any";
  if (/\b19\b/.test(range) && !/\b18\b/.test(range)) return "19";
  if (/\b18\b/.test(range)) return "18";
  return "any";
}

const FRAMEWORK_HINTS: Record<string, string> = {
  next: "next",
  react: "react",
  vue: "vue",
  svelte: "svelte",
  solid: "solid",
  "@angular/core": "angular",
};

const STYLING_HINTS: Record<string, string> = {
  tailwindcss: "tailwind",
  "styled-components": "css-in-js",
  "@emotion/react": "css-in-js",
  "@stitches/react": "css-in-js",
  sass: "sass",
  "@vanilla-extract/css": "vanilla-extract",
};

/**
 * Resolve a URL into a draft. Deliberately an action, not a mutation: it talks
 * to the network and writes nothing, so a failed lookup leaves no debris and a
 * curious visitor can run it without an account creating rows.
 */
export const inspect = action({
  args: { url: v.string() },
  handler: async (_ctx, args): Promise<ImportDraft | { error: string }> => {
    const input = args.url.trim();
    if (!input) return { error: "Paste a GitHub repo, an npm package, or a homepage." };

    const repo = parseGitHub(input);
    const pkgFromUrl = parseNpm(input);

    const [gh, npmMeta] = await Promise.all([
      repo
        ? getJson(
            `https://api.github.com/repos/${repo}`,
            process.env.GITHUB_TOKEN
              ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
              : {}
          )
        : Promise.resolve(null),
      pkgFromUrl ? getJson(`https://registry.npmjs.org/${pkgFromUrl}`) : Promise.resolve(null),
    ]);

    if (!gh && !npmMeta) {
      return {
        error: repo
          ? "GitHub didn't return that repository — check the URL, or that it's public."
          : "Couldn't resolve that. Paste a GitHub repo URL or an npm package URL.",
      };
    }

    // A GitHub repo often names its package, and vice versa; follow whichever
    // link exists so one paste resolves both sides.
    let pkg = pkgFromUrl;
    let meta = npmMeta;
    if (!meta && gh && typeof gh.name === "string") {
      const guess = await getJson(`https://registry.npmjs.org/${gh.name as string}`);
      const guessRepo =
        guess && typeof guess.repository === "object" && guess.repository
          ? ((guess.repository as Record<string, unknown>).url as string | undefined)
          : undefined;
      // Only accept the guess if the package points back at this repo.
      if (guess && guessRepo && parseGitHub(guessRepo) === repo) {
        meta = guess;
        pkg = gh.name as string;
      }
    }

    const unresolved: string[] = [];
    const facts: Record<string, number | string | boolean> = {};
    const tags = new Set<string>();

    if (gh) {
      if (typeof gh.stargazers_count === "number") facts.githubStars = gh.stargazers_count;
      if (typeof gh.open_issues_count === "number") facts.openIssues = gh.open_issues_count;
      if (typeof gh.pushed_at === "string") facts.lastCommit = Date.parse(gh.pushed_at);
      for (const topic of (gh.topics as string[] | undefined) ?? []) tags.add(topic);
    } else {
      unresolved.push("GitHub activity — no repository resolved");
    }

    let latestDoc: Record<string, unknown> | null = null;
    let downloads: number | undefined;

    if (meta && pkg) {
      const distTags = meta["dist-tags"] as Record<string, string> | undefined;
      const time = meta.time as Record<string, string> | undefined;
      const versions = meta.versions as Record<string, Record<string, unknown>> | undefined;
      const latest = distTags?.latest;
      if (latest) {
        facts.version = latest;
        latestDoc = versions?.[latest] ?? null;
        if (time?.[latest]) facts.lastPublish = Date.parse(time[latest]);
      }
      if (time?.created) facts.firstRelease = Date.parse(time.created);

      const [dl, bundle] = await Promise.all([
        getJson(`https://api.npmjs.org/downloads/point/last-week/${pkg}`),
        getJson(`https://bundlephobia.com/api/size?package=${encodeURIComponent(pkg)}`),
      ]);
      if (typeof dl?.downloads === "number") {
        facts.weeklyDownloads = dl.downloads;
        downloads = dl.downloads;
      }
      if (typeof bundle?.gzip === "number") facts.bundleBytes = bundle.gzip;
      for (const keyword of (meta.keywords as string[] | undefined) ?? []) tags.add(keyword);
    } else {
      unresolved.push("npm — no published package found under this name");
    }

    if (latestDoc) {
      const deps = (latestDoc.dependencies as Record<string, string> | undefined) ?? {};
      facts.dependencies = Object.keys(deps).length;
      if (typeof latestDoc.license === "string") facts.npmLicense = latestDoc.license;
    } else if (downloads === undefined) {
      unresolved.push("Bundle size and dependency count — needs a published package");
    }

    const peers =
      (latestDoc?.peerDependencies as Record<string, string> | undefined) ?? {};
    const allDeps = {
      ...((latestDoc?.dependencies as Record<string, string> | undefined) ?? {}),
      ...peers,
    };

    const frameworks = [
      ...new Set(
        Object.keys(allDeps)
          .map((dep) => FRAMEWORK_HINTS[dep])
          .filter((value): value is string => Boolean(value))
      ),
    ];
    const styling = [
      ...new Set(
        Object.keys(allDeps)
          .map((dep) => STYLING_HINTS[dep])
          .filter((value): value is string => Boolean(value))
      ),
    ];

    const typescript =
      Boolean(latestDoc?.types) ||
      Boolean(latestDoc?.typings) ||
      (gh?.language as string | undefined) === "TypeScript";

    const license =
      (typeof latestDoc?.license === "string" ? latestDoc.license : undefined) ??
      ((gh?.license as Record<string, unknown> | undefined)?.spdx_id as string | undefined) ??
      "";
    if (!license || license === "NOASSERTION") {
      unresolved.push("Licence — neither npm nor GitHub declares one");
    }

    const name =
      ((gh?.name as string | undefined) ?? (meta?.name as string | undefined) ?? pkg ?? "")
        .replace(/^@[^/]+\//, "");
    const tagline =
      ((gh?.description as string | undefined) ??
        (meta?.description as string | undefined) ??
        "").slice(0, 160);
    if (!tagline) unresolved.push("Tagline — neither source has a description");

    const homepage =
      (gh?.homepage as string | undefined) ||
      (typeof meta?.homepage === "string" ? meta.homepage : undefined) ||
      undefined;

    return {
      source: {
        ...(repo ? { repo } : {}),
        ...(pkg ? { npm: pkg } : {}),
        ...(homepage ? { homepage } : {}),
      },
      name,
      slug: slugify(name),
      tagline,
      description: tagline,
      license: license || "Unknown",
      licenseBucket: license ? licenseBucket(license) : "commercial",
      tags: [...tags].slice(0, 12),
      monogram: monogramOf(name),
      ...(repo ? { repo: `https://github.com/${repo}` } : {}),
      ...(pkg ? { npm: pkg } : {}),
      ...(homepage ? { homepage, docs: homepage } : {}),
      stack: {
        frameworks,
        styling,
        react: reactRange(peers.react),
        // Nothing in a package manifest states this, so we don't pretend to
        // know it. The submitter picks; the reviewer checks.
        rsc: "unknown",
        typescript,
        a11y: "unknown",
        install: pkg ? ["npm"] : [],
      },
      facts,
      unresolved,
    };
  },
});

/* ---------------------------------------------------------------- submit */

const stackValidator = v.object({
  frameworks: v.array(v.string()),
  styling: v.array(v.string()),
  react: v.string(),
  rsc: v.string(),
  typescript: v.boolean(),
  a11y: v.string(),
  install: v.array(v.string()),
});

export const create = mutation({
  args: {
    kind: v.union(
      v.literal("library"),
      v.literal("tool"),
      v.literal("resource"),
      v.literal("mcp"),
      v.literal("skill"),
      v.literal("api"),
      v.literal("repo")
    ),
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
    stack: stackValidator,
    facts: v.any(),
    color: v.string(),
    monogram: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Sign in to submit a listing");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) throw new Error("No profile");

    const name = args.name.trim();
    if (name.length < 2) throw new Error("Give it a name");
    if (!args.categories.length) throw new Error("Pick at least one category");

    let slug = slugify(name) || "listing";
    for (let attempt = 1; attempt < 40; attempt++) {
      const taken = await ctx.db
        .query("listings")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!taken) break;
      slug = `${slugify(name)}-${attempt + 1}`;
    }

    const now = Date.now();
    const id = await ctx.db.insert("listings", {
      kind: args.kind,
      slug,
      name,
      tagline: args.tagline.trim().slice(0, 160),
      description: args.description.trim().slice(0, 4000),
      categories: args.categories.slice(0, 8),
      tags: args.tags.slice(0, 12),
      ...(args.homepage ? { homepage: args.homepage } : {}),
      ...(args.repo ? { repo: args.repo } : {}),
      ...(args.npm ? { npm: args.npm } : {}),
      ...(args.docs ? { docs: args.docs } : {}),
      license: args.license,
      licenseBucket: args.licenseBucket,
      pricing: args.pricing,
      ...(args.priceNote ? { priceNote: args.priceNote } : {}),
      stack: args.stack,
      facts: { ...(args.facts ?? {}), fetchedAt: now },
      componentCount: 0,
      color: args.color,
      monogram: args.monogram,
      featured: false,
      // Verification means a maintainer proved they own it. Submitting is not
      // that, however trustworthy the submitter, so it is never set here.
      verified: false,
      status: "pending",
      submittedBy: userId,
      submittedByHandle: profile.handle,
      createdAt: now,
      updatedAt: now,
      views: 0,
      saves: 0,
      votes: 0,
    });
    return { id, slug };
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_submitter", (q) => q.eq("submittedBy", userId))
      .collect();
    return rows
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((row) => ({
        id: row._id as string,
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        kind: row.kind,
        status: row.status,
        color: row.color,
        monogram: row.monogram,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
  },
});

/* ------------------------------------------------------------ moderation */

async function requireStaff(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not signed in");
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    throw new Error("Not allowed");
  }
  return userId;
}

export const queue = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const status = (args.status ?? "pending") as "pending" | "live" | "rejected" | "draft";
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", status))
      .order("desc")
      .take(100);
    return rows.map((row) => ({
      id: row._id as string,
      slug: row.slug,
      name: row.name,
      tagline: row.tagline,
      kind: row.kind,
      categories: row.categories,
      license: row.license,
      repo: row.repo ?? null,
      npm: row.npm ?? null,
      homepage: row.homepage ?? null,
      facts: row.facts,
      stack: row.stack,
      submittedByHandle: row.submittedByHandle ?? null,
      createdAt: row.createdAt,
      status: row.status,
    }));
  },
});

export const decide = mutation({
  args: {
    id: v.id("listings"),
    decision: v.union(v.literal("approve"), v.literal("reject")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireStaff(ctx);
    const listing = await ctx.db.get(args.id);
    if (!listing) throw new Error("No such listing");
    await ctx.db.patch(args.id, {
      status: args.decision === "approve" ? "live" : "rejected",
      updatedAt: Date.now(),
    });
    return { ok: true, slug: listing.slug };
  },
});
