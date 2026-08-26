import generated from "./facts.generated.json";
import type { Listing, ListingFacts, StackProfile } from "@/lib/types";

/**
 * Seed content is a catalogue of real third-party projects. The descriptive
 * fields are authored; every *number* comes from `facts.generated.json`, which
 * `scripts/fetch-facts.mjs` populates from the npm registry, the npm downloads
 * API and bundlephobia.
 *
 * Nothing is invented. A project we could not fetch a figure for simply has no
 * figure — Ship Score marks that dimension N/A rather than guessing, and the UI
 * says "not fetched yet" rather than showing a plausible-looking number.
 *
 * GitHub stars and last-commit need a token to fetch reliably, so they are
 * absent here and collected at runtime by `convex/ingest.ts`.
 */

type GeneratedFacts = {
  fetchedAt: number;
  facts: Record<string, Partial<ListingFacts> & { npmLicense?: string }>;
};

const generatedFacts = generated as GeneratedFacts;

export const FACTS_FETCHED_AT = generatedFacts.fetchedAt;

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
  | "_id" | "createdAt" | "updatedAt" | "views" | "saves" | "votes"
  | "componentCount" | "facts"
>;

export function hydrate(seed: SeedListing): Listing {
  const fetched = generatedFacts.facts[seed.slug] ?? {};
  const facts: ListingFacts = {
    ...fetched,
    hasDocs: Boolean(seed.docs),
    fetchedAt: FACTS_FETCHED_AT,
  };

  return {
    ...seed,
    _id: `listing:${seed.slug}`,
    facts,
    componentCount: 0,
    // "Added to the catalogue" — the seed load is when these entered it.
    createdAt: FACTS_FETCHED_AT,
    updatedAt: facts.lastPublish ?? FACTS_FETCHED_AT,
    // Engagement is earned, never seeded. These climb from real events.
    views: 0,
    saves: 0,
    votes: 0,
  };
}
