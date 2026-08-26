import { describe, expect, it } from "vitest";
import { CONFIDENCE_THRESHOLD, computeShipScore } from "@/lib/ship-score";
import { facetCounts, queryListings } from "@/lib/query-engine";
import { seedListings } from "@/lib/seed";
import type { Listing } from "@/lib/types";

const base = seedListings[0]!;

function withFacts(facts: Partial<Listing["facts"]>, extra: Partial<Listing> = {}): Listing {
  return { ...base, ...extra, facts: { ...facts } };
}

describe("Ship Score grades on evidence, or says it cannot", () => {
  it("drops unmeasurable dimensions from the denominator instead of scoring them zero", () => {
    // A hosted SaaS tool has no bundle to weigh. Scoring that zero would rank
    // it below a library purely for not being a package.
    const hosted = withFacts(
      { hasDocs: true, fetchedAt: 1 },
      { kind: "tool", npm: undefined, stack: { ...base.stack, install: ["cdn"] } }
    );
    const score = computeShipScore(hosted);

    const na = score.dimensions.filter((d) => d.points === null);
    expect(na.length).toBeGreaterThan(0);
    expect(score.applicableMax).toBe(
      score.dimensions
        .filter((d) => d.points !== null)
        .reduce((sum, d) => sum + d.max, 0)
    );
    expect(score.applicableMax).toBeLessThan(100);
  });

  it("flags a score as provisional when too little could be measured", () => {
    const sparse = withFacts({ fetchedAt: 1 });
    const score = computeShipScore(sparse);
    if (score.applicableMax < CONFIDENCE_THRESHOLD) {
      expect(score.provisional).toBe(true);
    }
  });

  it("never lets a sparse listing outrank a well-documented one on confidence", () => {
    // The failure this guards against: a listing with almost no data scoring
    // 100/100 out of 20 available points and topping the grid.
    const graded = seedListings
      .map((l) => ({ slug: l.slug, ...computeShipScore(l) }))
      .filter((s) => s.score === 100);

    for (const perfect of graded) {
      expect(
        perfect.provisional,
        `${perfect.slug} scores 100 on only ${perfect.applicableMax} points and isn't flagged`
      ).toBe(perfect.applicableMax < CONFIDENCE_THRESHOLD);
    }
  });

  it("gives every dimension a piece of evidence, not just a number", () => {
    for (const listing of seedListings) {
      for (const dimension of computeShipScore(listing).dimensions) {
        expect(dimension.note.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("is never influenced by engagement", () => {
    const quiet = computeShipScore(base);
    const popular = computeShipScore({ ...base, views: 99_999, saves: 500, votes: 300 });
    expect(popular.score).toBe(quiet.score);
  });
});

describe("faceted search", () => {
  it("ORs within a facet group and ANDs across groups", () => {
    const mit = queryListings(seedListings, { facets: { license: ["mit"] }, limit: 500 });
    const apache = queryListings(seedListings, {
      facets: { license: ["apache-2.0"] },
      limit: 500,
    });
    const either = queryListings(seedListings, {
      facets: { license: ["mit", "apache-2.0"] },
      limit: 500,
    });
    // Two values in one group widen the result set.
    expect(either.total).toBe(mit.total + apache.total);

    const mitAndReact19 = queryListings(seedListings, {
      facets: { license: ["mit"], react: ["19"] },
      limit: 500,
    });
    // A second group can only narrow it.
    expect(mitAndReact19.total).toBeLessThanOrEqual(mit.total);
  });

  it("counts a facet's options as if that facet were not applied", () => {
    // Otherwise every unselected option in the group you just filtered by
    // reads as zero, and the filter panel becomes a dead end.
    const withSelection = facetCounts(seedListings, {}, { license: ["mit"] });
    const clean = facetCounts(seedListings, {}, {});
    expect(withSelection.license?.["apache-2.0"]).toBe(clean.license?.["apache-2.0"]);
  });

  it("narrows other groups' counts by the current selection", () => {
    const all = facetCounts(seedListings, {}, {});
    const narrowed = facetCounts(seedListings, {}, { license: ["mit"] });
    const anyStylingKey = Object.keys(all.styling ?? {})[0];
    if (anyStylingKey) {
      expect(narrowed.styling?.[anyStylingKey] ?? 0).toBeLessThanOrEqual(
        all.styling?.[anyStylingKey] ?? 0
      );
    }
  });

  it("paginates without dropping or repeating a listing", () => {
    const first = queryListings(seedListings, { limit: 10, offset: 0 });
    const second = queryListings(seedListings, { limit: 10, offset: 10 });
    const overlap = first.items.filter((a) =>
      second.items.some((b) => b.slug === a.slug)
    );
    expect(overlap).toEqual([]);
    expect(first.total).toBe(second.total);
  });
});
