"use node";

import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * FACT INGESTION
 * ==============
 * The catalogue never invents a number. Everything under `listing.facts` is
 * fetched here, stamped with `fetchedAt`, and left absent when a source can't
 * confirm it — Ship Score then marks that dimension N/A instead of guessing.
 *
 * Sources, in order of how much they can be trusted:
 *   api.github.com        stars, last push, open issues   (GITHUB_TOKEN raises the rate limit)
 *   registry.npmjs.org    version, publish dates, runtime dependency count, licence
 *   api.npmjs.org         weekly downloads
 *   bundlephobia.com      min+gzip size
 *
 * Run manually:  npx convex run ingest:refreshAll
 * Scheduled:     see convex/crons.ts (daily)
 */

type FetchedFacts = {
  githubStars?: number;
  lastCommit?: number;
  openIssues?: number;
  weeklyDownloads?: number;
  version?: string;
  lastPublish?: number;
  firstRelease?: number;
  dependencies?: number;
  npmLicense?: string;
  bundleBytes?: number;
};

/** External JSON of unknown shape — read defensively at every access. */
type Json = Record<string, unknown> | null;

/**
 * Every failure here becomes an absent field, which is the right outcome — we
 * would rather print nothing than a number we cannot stand behind.
 *
 * But absent-because-nobody-published-it and absent-because-GitHub-refused-us
 * look identical from the catalogue, and only one of those is fixable. So a
 * refusal says so in the logs. Without this the whole GitHub half of ingestion
 * can fail for every listing and the only symptom is a column of blanks that
 * looks like the projects are simply quiet.
 */
async function getJson(
  url: string,
  headers: Record<string, string> = {}
): Promise<Json> {
  const source = new URL(url).host;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "vitrine-ingest", ...headers },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      // 403 with no remaining quota is the rate limit; 404 usually means the
      // repo moved or went private, which is worth knowing about too.
      const remaining = res.headers.get("x-ratelimit-remaining");
      const rateLimited = res.status === 403 && remaining === "0";
      console.warn(
        rateLimited
          ? `[ingest] ${source} rate limit exhausted — set GITHUB_TOKEN on this deployment to raise it`
          : `[ingest] ${source} returned ${res.status} for ${url}`
      );
      return null;
    }
    return await res.json();
  } catch (error) {
    console.warn(
      `[ingest] ${source} unreachable: ${error instanceof Error ? error.message : "unknown"}`
    );
    return null;
  }
}

/** "https://github.com/owner/repo" -> "owner/repo" */
function parseRepo(repo: string | undefined): string | null {
  if (!repo) return null;
  const match = /github\.com\/([^/]+)\/([^/#?]+)/.exec(repo);
  if (!match) return null;
  return `${match[1]}/${match[2]!.replace(/\.git$/, "")}`;
}

async function fetchGitHub(repo: string): Promise<Partial<FetchedFacts>> {
  const token = process.env.GITHUB_TOKEN;
  const data = await getJson(
    `https://api.github.com/repos/${repo}`,
    token ? { authorization: `Bearer ${token}` } : {}
  );
  if (!data) return {};
  const facts: Partial<FetchedFacts> = {};
  if (typeof data.stargazers_count === "number") facts.githubStars = data.stargazers_count;
  if (typeof data.open_issues_count === "number") facts.openIssues = data.open_issues_count;
  if (typeof data.pushed_at === "string") facts.lastCommit = Date.parse(data.pushed_at);
  return facts;
}

async function fetchNpm(pkg: string): Promise<Partial<FetchedFacts>> {
  const [meta, downloads, bundle] = await Promise.all([
    getJson(`https://registry.npmjs.org/${pkg}`),
    getJson(`https://api.npmjs.org/downloads/point/last-week/${pkg}`),
    getJson(`https://bundlephobia.com/api/size?package=${encodeURIComponent(pkg)}`),
  ]);

  const facts: Partial<FetchedFacts> = {};

  if (meta) {
    const distTags = meta["dist-tags"] as Record<string, string> | undefined;
    const time = meta.time as Record<string, string> | undefined;
    const versions = meta.versions as Record<string, Record<string, unknown>> | undefined;
    const latest = distTags?.latest;

    if (latest) {
      facts.version = latest;
      const doc = versions?.[latest];
      if (doc) {
        const deps = doc.dependencies as Record<string, string> | undefined;
        facts.dependencies = deps ? Object.keys(deps).length : 0;
        if (typeof doc.license === "string") facts.npmLicense = doc.license;
      }
      const published = time?.[latest];
      if (published) facts.lastPublish = Date.parse(published);
    }
    if (time?.created) facts.firstRelease = Date.parse(time.created);
  }

  const weekly = downloads?.downloads;
  if (typeof weekly === "number") facts.weeklyDownloads = weekly;

  const gzip = bundle?.gzip;
  if (typeof gzip === "number") facts.bundleBytes = gzip;
  const bundleDeps = bundle?.dependencyCount;
  if (typeof bundleDeps === "number" && facts.dependencies === undefined) {
    facts.dependencies = bundleDeps;
  }
  return facts;
}

export const refreshOne = internalAction({
  args: { slug: v.string() },
  handler: async (ctx, args): Promise<{ slug: string; fields: number }> => {
    const listing = await ctx.runQuery(internal.ingestData.listingForIngest, {
      slug: args.slug,
    });
    if (!listing) return { slug: args.slug, fields: 0 };

    const facts: FetchedFacts = {};
    const repo = parseRepo(listing.repo);
    if (repo) Object.assign(facts, await fetchGitHub(repo));
    if (listing.npm) Object.assign(facts, await fetchNpm(listing.npm));

    await ctx.runMutation(internal.ingestData.applyFacts, {
      slug: args.slug,
      facts,
    });
    return { slug: args.slug, fields: Object.keys(facts).length };
  },
});

export const refreshAll = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ scheduled: number }> => {
    const slugs = await ctx.runQuery(internal.ingestData.slugsForIngest, {
      limit: args.limit ?? 500,
    });
    // Spread the work out — bundlephobia in particular rate-limits hard, and a
    // stale figure is much cheaper than a blocked source.
    slugs.forEach((slug: string, index: number) => {
      void ctx.scheduler.runAfter(index * 3_000, internal.ingest.refreshOne, { slug });
    });
    return { scheduled: slugs.length };
  },
});
