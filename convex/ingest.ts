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
      if (rateLimited) {
        // Report the ceiling and the reset, not just the fact of refusal. A
        // limit of 60 means we are calling GitHub anonymously and the fix is a
        // token; 5,000 means the token is working and we are simply asking too
        // fast. And Convex actions run from shared egress addresses, so the
        // anonymous 60/hr is pooled with other tenants — a reset far in the
        // future is somebody else's traffic, not ours, which is the difference
        // between "wait" and "pace differently".
        const limit = res.headers.get("x-ratelimit-limit") ?? "?";
        const reset = Number(res.headers.get("x-ratelimit-reset"));
        const waitSeconds = Number.isFinite(reset)
          ? Math.max(0, Math.round(reset - Date.now() / 1_000))
          : null;
        console.warn(
          `[ingest] ${source} refused: 0 of ${limit} requests/hr left` +
            (waitSeconds === null ? "" : `, resets in ${waitSeconds}s`) +
            (limit === "60"
              ? " — anonymous quota, shared across this Convex deployment's egress." +
                " Set GITHUB_TOKEN to get a private 5,000/hr allowance."
              : "")
        );
      } else {
        console.warn(`[ingest] ${source} returned ${res.status} for ${url}`);
      }
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
  handler: async (
    ctx,
    args
  ): Promise<{ slug: string; fields: number; complete: boolean }> => {
    const listing = await ctx.runQuery(internal.ingestData.listingForIngest, {
      slug: args.slug,
    });
    if (!listing) return { slug: args.slug, fields: 0, complete: false };

    const facts: FetchedFacts = {};
    const repo = parseRepo(listing.repo);

    // `complete` means every source this listing declares actually answered.
    // It is not the same as "we got some facts": a listing with an npm package
    // and a repo can come back with full npm data and nothing from GitHub, and
    // treating that as a successful refresh is what buries the failure.
    let complete = true;

    if (repo) {
      const github = await fetchGitHub(repo);
      Object.assign(facts, github);
      // The repo endpoint always carries `stargazers_count`, so its absence is
      // GitHub refusing us — never a project that genuinely has no stars.
      if (github.githubStars === undefined) complete = false;
    }
    if (listing.npm) {
      const npm = await fetchNpm(listing.npm);
      Object.assign(facts, npm);
      // Likewise `dist-tags.latest`: every published package has one. (Bundle
      // size is not checked — bundlephobia legitimately 404s for packages it
      // cannot build, and that is an absent fact, not a failed refresh.)
      if (npm.version === undefined) complete = false;
    }

    await ctx.runMutation(internal.ingestData.applyFacts, {
      slug: args.slug,
      facts,
      complete,
    });
    return { slug: args.slug, fields: Object.keys(facts).length, complete };
  },
});

export const refreshAll = internalAction({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ scheduled: number }> => {
    const slugs = await ctx.runQuery(internal.ingestData.slugsForIngest, {
      limit: args.limit ?? 500,
    });

    // Pace the batch to whichever GitHub rate limit is actually in force.
    // Unauthenticated callers get 60 requests an hour, so a 3s spread burns the
    // quota inside four minutes and 403s the rest of the catalogue — which is
    // exactly what a wall of blank star counts looks like from the outside. A
    // token raises the ceiling to 5,000/hr, and then the binding constraint is
    // bundlephobia again, which is what the 3s was for.
    const spacingMs = process.env.GITHUB_TOKEN ? 3_000 : 65_000;

    // Scheduling is a write, and awaiting it is not optional: discarding these
    // promises let the action return — and the request finish — before they
    // committed, so `scheduled` reported intent and nothing ever ran.
    const scheduled = await Promise.all(
      slugs.map((slug: string, index: number) =>
        ctx.scheduler.runAfter(index * spacingMs, internal.ingest.refreshOne, { slug })
      )
    );
    return { scheduled: scheduled.length };
  },
});
