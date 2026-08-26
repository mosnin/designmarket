import type { Listing, ListingFacts, StackProfile } from "@/lib/types";
import { stableHash } from "@/lib/utils";

/**
 * Seed content.
 *
 * These records describe real projects, but the *numbers* (stars, downloads,
 * bundle size, last commit) are illustrative seed values chosen to be
 * plausible, not scraped. `convex/ingest.ts` refreshes them from the GitHub
 * and npm APIs once a deployment exists; until then they exist so the app has
 * something honest-shaped to render.
 *
 * Everything derived from them — Ship Score especially — therefore moves as
 * soon as real data lands, which is the point: the score is a function of
 * facts, not a hand-written number.
 */

/** Fixed clock so every derived value is deterministic across builds. */
export const SEED_NOW = Date.UTC(2026, 7, 20);
export const DAY = 86_400_000;

export function daysAgo(n: number): number {
  return SEED_NOW - n * DAY;
}

type StackInput = Partial<StackProfile>;

export function stack(input: StackInput): StackProfile {
  return {
    frameworks: input.frameworks ?? ["react"],
    styling: input.styling ?? ["tailwind-4"],
    react: input.react ?? "19",
    rsc: input.rsc ?? "client",
    typescript: input.typescript ?? true,
    a11y: input.a11y ?? "unknown",
    install: input.install ?? ["npm"],
  };
}

export type SeedListing = Omit<
  Listing,
  "_id" | "createdAt" | "updatedAt" | "views" | "saves" | "votes" | "componentCount"
> & {
  createdAt?: number;
  componentCount?: number;
};

/**
 * Counters are derived from a stable hash of the slug rather than stored, so
 * seed data has no hand-authored vanity numbers and never drifts between the
 * server render and the client.
 */
export function hydrate(seed: SeedListing): Listing {
  const h = stableHash(seed.slug);
  const h2 = stableHash(`${seed.slug}:v`);
  const popularity =
    (seed.facts.githubStars ?? 0) / 1000 + (seed.facts.weeklyDownloads ?? 0) / 50_000;
  const createdAt = seed.createdAt ?? daysAgo(30 + Math.floor(h * 600));
  return {
    ...seed,
    _id: `listing:${seed.slug}`,
    componentCount: seed.componentCount ?? 0,
    createdAt,
    updatedAt: seed.facts.lastCommit ?? createdAt,
    views: Math.round(400 + h * 9_000 + popularity * 120),
    saves: Math.round(20 + h2 * 700 + popularity * 14),
    votes: Math.round(8 + h2 * 320 + popularity * 9),
  };
}

export const facts = (f: ListingFacts): ListingFacts => f;
