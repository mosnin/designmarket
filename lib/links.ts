import { sectionForKind } from "./taxonomy";
import type { Listing, ListingKind } from "./types";

/**
 * A listing lives under its section — `/mcp/playwright-mcp`, not `/l/…` — so
 * the sidebar can tell which market you are in from the URL alone, with no
 * context threading and no client-side hint. `/l/<slug>` still resolves and
 * redirects here, so a listing that changes kind during moderation does not
 * break the links people already shared.
 */
export function listingHref(listing: Pick<Listing, "slug" | "kind">): string {
  const section = sectionForKind(listing.kind);
  return `${section?.href ?? "/explore"}/${listing.slug}`;
}

const KIND_LABEL: Record<ListingKind, string> = {
  library: "Library",
  tool: "Tool",
  resource: "Resource",
  mcp: "MCP server",
  skill: "Skill",
  api: "API",
  repo: "Repository",
};

export function kindLabel(kind: ListingKind): string {
  return KIND_LABEL[kind] ?? kind;
}
