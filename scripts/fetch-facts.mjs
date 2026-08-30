/**
 * Fetches real package facts for every listing that names an npm package and
 * writes them to `lib/seed/facts.generated.json`.
 *
 * Sources:
 *   registry.npmjs.org   version, license, runtime dependency count, last publish
 *   api.npmjs.org        weekly downloads
 *   bundlephobia.com     min+gzip size
 *
 * GitHub stars and last-commit are deliberately NOT fetched here — they need a
 * token to be reliable, so `convex/ingest.ts` collects them at runtime instead.
 * Anything we cannot verify is simply left absent; Ship Score marks the missing
 * dimensions N/A rather than guessing.
 *
 *   node scripts/fetch-facts.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = [
  readFileSync(join(root, "lib/seed/listings.ts"), "utf8"),
  readFileSync(join(root, "lib/seed/listings-extra.ts"), "utf8"),
].join("\n");

// Pull (slug, npm) pairs straight out of the seed source so the script has no
// build step and stays in sync with whatever is listed.
const entries = [];
const blocks = source.split(/\n  \{\n?/).slice(1);
for (const block of blocks) {
  const slug = /\bslug: "([^"]+)"/.exec(block)?.[1];
  const npm = /\bnpm: "([^"]+)"/.exec(block)?.[1];
  const docs = /\bdocs: "/.test(block);
  if (slug) entries.push({ slug, npm, docs });
}

const timeout = (ms) => new AbortController1(ms);
function AbortController1(ms) {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function getJson(url, ms = 20000) {
  try {
    const res = await fetch(url, {
      signal: timeout(ms),
      headers: { "user-agent": "vitrine-facts-script" },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchNpmFacts(pkg) {
  const encoded = pkg.startsWith("@")
    ? `@${encodeURIComponent(pkg.slice(1))}`.replace("%2F", "/")
    : pkg;

  const [meta, downloads, bundle] = await Promise.all([
    getJson(`https://registry.npmjs.org/${encoded}`),
    getJson(`https://api.npmjs.org/downloads/point/last-week/${encoded}`),
    getJson(`https://bundlephobia.com/api/size?package=${encodeURIComponent(pkg)}`, 30000),
  ]);

  const facts = {};
  if (meta) {
    const latest = meta["dist-tags"]?.latest;
    if (latest) facts.version = latest;
    const versionDoc = latest ? meta.versions?.[latest] : undefined;
    if (versionDoc?.license && typeof versionDoc.license === "string") {
      facts.npmLicense = versionDoc.license;
    }
    if (versionDoc?.dependencies) {
      facts.dependencies = Object.keys(versionDoc.dependencies).length;
    } else if (versionDoc) {
      facts.dependencies = 0;
    }
    const published = latest ? meta.time?.[latest] : meta.time?.modified;
    if (published) facts.lastPublish = Date.parse(published);
    const created = meta.time?.created;
    if (created) facts.firstRelease = Date.parse(created);
  }
  if (typeof downloads?.downloads === "number") {
    facts.weeklyDownloads = downloads.downloads;
  }
  if (typeof bundle?.gzip === "number") facts.bundleBytes = bundle.gzip;
  if (typeof bundle?.dependencyCount === "number" && facts.dependencies === undefined) {
    facts.dependencies = bundle.dependencyCount;
  }
  return facts;
}

const out = {};
let done = 0;
for (const entry of entries) {
  const facts = { hasDocs: entry.docs };
  if (entry.npm) {
    Object.assign(facts, await fetchNpmFacts(entry.npm));
  }
  out[entry.slug] = facts;
  done += 1;
  process.stdout.write(
    `\r${done}/${entries.length} ${entry.slug.padEnd(28)}`.slice(0, 60)
  );
}
process.stdout.write("\n");

writeFileSync(
  join(root, "lib/seed/facts.generated.json"),
  `${JSON.stringify({ fetchedAt: Date.now(), facts: out }, null, 2)}\n`
);

const withDownloads = Object.values(out).filter((f) => f.weeklyDownloads).length;
const withBundle = Object.values(out).filter((f) => f.bundleBytes).length;
console.log(
  `wrote lib/seed/facts.generated.json — ${entries.length} listings, ${withDownloads} with downloads, ${withBundle} with bundle size`
);
