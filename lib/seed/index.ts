import { baseListings } from "./listings";
import { extraListings } from "./listings-extra";
import { seedComponents } from "./components";
import type { Listing } from "@/lib/types";

/**
 * `componentCount` is how many components this catalogue actually indexes for
 * a listing — a number we can stand behind — rather than a claim copied off
 * the project's marketing page.
 */
const indexed = new Map<string, number>();
for (const component of seedComponents) {
  indexed.set(component.listingSlug, (indexed.get(component.listingSlug) ?? 0) + 1);
}

export const seedListings: Listing[] = [...baseListings, ...extraListings].map((listing) => ({
  ...listing,
  componentCount: indexed.get(listing.slug) ?? 0,
}));

export { seedComponents };
export { seedCollections, seedDrops } from "./collections";
export { FACTS_FETCHED_AT } from "./helpers";
