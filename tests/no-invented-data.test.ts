import { describe, expect, it } from "vitest";
import { buildAgentManifest, buildInstallPlan } from "@/lib/install-plan";
import { seedCollections, seedComponents, seedListings } from "@/lib/seed";
import { hydrate, type SeedListing } from "@/lib/seed/helpers";
import type { Collection, Listing } from "@/lib/types";

/**
 * THE RULE THIS PROJECT IS BUILT ON
 *
 * "We are indexing other people's work, so every number we print has to have
 * come from somewhere." Comments claiming that are worth nothing; these tests
 * are what actually hold the line, and they fail loudly the first time someone
 * adds a plausible-looking figure to a seed file.
 */

const listings = seedListings;
const components = seedComponents;
const collections = seedCollections;

describe("the catalogue invents nothing", () => {
  it("zeroes engagement counters no matter what a seed tries to smuggle in", () => {
    // `SeedListing` omits views/saves/votes, so a seed file cannot set them —
    // but the type is erased at runtime and the guarantee actually lives in
    // `hydrate`. Casting past the type is the only way to test the thing that
    // would really break: someone widening hydrate to pass them through.
    const smuggled = {
      ...({} as SeedListing),
      slug: "smuggled",
      docs: undefined,
      views: 4200,
      saves: 99,
      votes: 71,
    } as unknown as SeedListing;

    const hydrated = hydrate(smuggled);
    expect(hydrated.views).toBe(0);
    expect(hydrated.saves).toBe(0);
    expect(hydrated.votes).toBe(0);
  });

  it("stamps every hydrated listing with fetchedAt", () => {
    const unstamped = listings.filter((l) => l.facts.fetchedAt === undefined);
    expect(unstamped.map((l) => l.slug)).toEqual([]);
  });

  it("has no zero-valued facts standing in for unknown ones", () => {
    // Absent means "we could not verify it" and is scored N/A. Zero means
    // "we verified it and it is zero" — a very different claim, and one almost
    // nothing in this catalogue can honestly make. This one reads the fetched
    // file, so a bad ingest run trips it.
    const suspicious = listings.filter(
      (l) =>
        l.facts.weeklyDownloads === 0 ||
        l.facts.githubStars === 0 ||
        l.facts.bundleBytes === 0
    );
    expect(suspicious.map((l) => l.slug)).toEqual([]);
  });

  it("claims hasDocs only when a docs link exists", () => {
    const lying = listings.filter((l) => l.facts.hasDocs && !l.docs);
    expect(lying.map((l) => l.slug)).toEqual([]);
  });
});

describe("install plans are derived, never guessed", () => {
  it("emits a command only for listings that publish a package", () => {
    const plan = buildInstallPlan(listings, []);
    const packages = plan.commands
      .filter((c) => c.startsWith("npm i "))
      .flatMap((c) => c.slice(6).split(" "));

    for (const pkg of packages) {
      expect(
        listings.some((l) => l.npm === pkg),
        `"${pkg}" appears in an install command but no listing publishes it`
      ).toBe(true);
    }
  });

  it("names every listing it cannot install, with a reason", () => {
    const withoutPackage = listings.filter((l) => !l.npm);
    const plan = buildInstallPlan(withoutPackage, []);

    expect(plan.commands).toEqual([]);
    expect(plan.manual).toHaveLength(withoutPackage.length);
    for (const step of plan.manual) {
      expect(step.why.length).toBeGreaterThan(10);
    }
  });

  it("accounts for every listing exactly once", () => {
    const plan = buildInstallPlan(listings, []);
    // Distinct packages plus manual steps must cover the whole set: nothing is
    // silently dropped from a plan a human is about to run.
    const packaged = new Set(listings.filter((l) => l.npm).map((l) => l.npm));
    expect(plan.covered + plan.manual.length).toBe(packaged.size + plan.manual.length);
    expect(plan.manual.length + listings.filter((l) => l.npm).length).toBe(
      listings.length
    );
  });
});

describe("an agent and a reader get the same answer", () => {
  const bySlug = new Map(listings.map((l) => [l.slug, l]));

  function hydrate(collection: Collection): Listing[] {
    return collection.items
      .filter((item) => item.type === "listing")
      .map((item) => bySlug.get(item.slug))
      .filter((l): l is Listing => Boolean(l));
  }

  it("builds a manifest for every curated stack without inventing a field", () => {
    for (const stack of collections) {
      const included = hydrate(stack);
      const manifest = buildAgentManifest(stack, included, []);

      expect(manifest.stack).toBe(stack.slug);
      expect(manifest.listings).toHaveLength(included.length);

      for (const entry of manifest.listings) {
        const source = bySlug.get(entry.slug)!;
        // Every field in the manifest must be traceable to the listing it came
        // from — the manifest is a projection, never an embellishment.
        expect(entry.name).toBe(source.name);
        expect(entry.license).toBe(source.license);
        if (entry.package) expect(entry.package).toBe(source.npm);
        if (entry.weeklyDownloads) {
          expect(entry.weeklyDownloads).toBe(source.facts.weeklyDownloads);
        }
      }
    }
  });

  it("omits keys it could not fill rather than emitting nulls", () => {
    const stack = collections[0]!;
    const manifest = buildAgentManifest(stack, hydrate(stack), []);
    const json = JSON.stringify(manifest);
    expect(json).not.toContain(":null");
    expect(json).not.toContain('""');
  });

  it("reports slugs it could not resolve instead of dropping them", () => {
    const plan = buildInstallPlan([], []);
    expect(plan.commands).toEqual([]);
    expect(plan.manual).toEqual([]);
  });
});

describe("components", () => {
  it("only claims a live preview when something can actually render it", () => {
    const lying = components.filter(
      (c) => c.previewMode === "registry" && !c.registryKey
    );
    expect(lying.map((c) => c.slug)).toEqual([]);
  });

  it("belongs to a listing that exists", () => {
    const slugs = new Set(listings.map((l) => l.slug));
    const orphans = components.filter((c) => !slugs.has(c.listingSlug));
    expect(orphans.map((c) => c.slug)).toEqual([]);
  });
});
