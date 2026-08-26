/**
 * Shared domain types.
 *
 * These are the shapes the UI consumes. Both the Convex-backed data layer and
 * the bundled seed dataset conform to them, so pages never learn which one
 * they are talking to.
 */

export type ListingKind =
  | "library"
  | "tool"
  | "resource"
  | "mcp"
  | "skill"
  | "api"
  | "repo";
export type ListingStatus = "draft" | "pending" | "live" | "rejected";
export type PreviewMode = "registry" | "compiled" | "static";

export type StackProfile = {
  /** facet: framework */
  frameworks: string[];
  /** facet: styling */
  styling: string[];
  /** facet: react — "19" | "18" | "any" */
  react: string;
  /** facet: rsc — "safe" | "client" | "mixed" */
  rsc: string;
  /** facet: typescript */
  typescript: boolean;
  /** facet: a11y — "audited" | "partial" | "unknown" */
  a11y: string;
  /** facet: install */
  install: string[];
};

/**
 * Every field here is fetched, never authored. Absent means "we could not
 * verify it", which the UI states plainly and Ship Score treats as N/A.
 */
export type ListingFacts = {
  /** from the GitHub API, collected by convex/ingest.ts */
  githubStars?: number;
  /** ms epoch — GitHub push time, when we have it */
  lastCommit?: number;
  contributors?: number;
  openIssues?: number;
  /** from api.npmjs.org */
  weeklyDownloads?: number;
  /** from the npm registry */
  version?: string;
  /** ms epoch — publish time of the current version */
  lastPublish?: number;
  /** ms epoch — first publish */
  firstRelease?: number;
  /** count of runtime dependencies declared in package.json */
  dependencies?: number;
  /** the licence npm reports, which is not always what the README claims */
  npmLicense?: string;
  /** min+gzip of the primary entry point, from bundlephobia */
  bundleBytes?: number;
  /** derived: does the listing point at a dedicated docs site */
  hasDocs?: boolean;
  /** ms epoch — when these facts were last refreshed */
  fetchedAt?: number;
};

/**
 * Fields that only make sense for one kind of listing. Kept in one optional
 * bag rather than spread across the root, so adding a seventh kind later does
 * not widen every record in the catalogue.
 */
export type KindDetails = {
  /** mcp: how the server is reached */
  transport?: "stdio" | "http" | "sse" | "both";
  /** mcp: the tools it exposes */
  tools?: string[];
  /** mcp / api: what authentication it needs */
  auth?: string;
  /** skill: the one-line trigger that tells an agent to reach for it */
  trigger?: string;
  /** skill: which agents it runs in */
  runsIn?: string[];
  /** api: base URL */
  baseUrl?: string;
  /** api: rate limit, in plain words */
  rateLimit?: string;
  /** api: does it publish an OpenAPI document */
  openapi?: boolean;
  /** repo: primary language */
  language?: string;
  /** repo: what shape of thing this is */
  shape?: string;
};

export type Listing = {
  _id: string;
  kind: ListingKind;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  tags: string[];
  homepage?: string;
  repo?: string;
  npm?: string;
  docs?: string;
  /** SPDX-ish identifier, or "Commercial" */
  license: string;
  /** facet: license bucket */
  licenseBucket: string;
  /** facet: pricing */
  pricing: string;
  priceNote?: string;
  stack: StackProfile;
  facts: ListingFacts;
  componentCount: number;
  /** fields that only apply to this kind of listing */
  details?: KindDetails;
  /** brand hue used for generated card art, as an oklch/hex string */
  color: string;
  /** two-letter monogram used when no logo is available */
  monogram: string;
  featured: boolean;
  verified: boolean;
  status: ListingStatus;
  submittedByHandle?: string;
  createdAt: number;
  updatedAt: number;
  views: number;
  saves: number;
  votes: number;
};

export type ComponentProp = {
  name: string;
  type: "enum" | "boolean" | "string" | "number";
  options?: string[];
  defaultValue?: string | boolean | number;
  description?: string;
};

export type UIComponent = {
  _id: string;
  listingSlug: string;
  slug: string;
  name: string;
  kind: string;
  description: string;
  previewMode: PreviewMode;
  /** key into the first-party render registry, when previewMode is "registry" */
  registryKey?: string;
  /** JSX source shown in the code panel and compiled when previewMode is "compiled" */
  source?: string;
  installCommand?: string;
  importLine?: string;
  props: ComponentProp[];
  deps: string[];
  a11yNotes?: string;
  tags: string[];
  featured: boolean;
  /** preferred preview canvas height in px */
  canvasHeight?: number;
  /** render the preview against the dot grid rather than flat surface */
  gridBackdrop?: boolean;
  createdAt: number;
  views: number;
  saves: number;
};

export type CollectionKind = "stack" | "board";

export type CollectionItem = {
  type: "listing" | "component";
  slug: string;
  note?: string;
};

export type Collection = {
  _id: string;
  kind: CollectionKind;
  slug: string;
  name: string;
  description: string;
  ownerHandle?: string;
  visibility: "public" | "private";
  curated: boolean;
  items: CollectionItem[];
  color: string;
  saves: number;
  createdAt: number;
  updatedAt: number;
};

export type Drop = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  headline: string;
  note: string;
  listingSlugs: string[];
  componentSlugs: string[];
};

export type SortKey =
  | "trending"
  | "newest"
  | "updated"
  | "ship-score"
  | "stars"
  | "downloads"
  | "alpha";

export type ListingQuery = {
  kind?: ListingKind | "all";
  /** several kinds at once — a section is a lens over one or more kinds */
  kinds?: string[];
  category?: string;
  q?: string;
  facets?: Record<string, string[]>;
  sort?: SortKey;
  limit?: number;
  offset?: number;
  featuredOnly?: boolean;
};

export type ComponentQuery = {
  kind?: string;
  listingSlug?: string;
  category?: string;
  q?: string;
  facets?: Record<string, string[]>;
  sort?: SortKey;
  limit?: number;
  offset?: number;
  renderableOnly?: boolean;
};

export type Page<T> = {
  items: T[];
  total: number;
  hasMore: boolean;
};
