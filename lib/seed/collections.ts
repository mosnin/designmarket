import type { Collection, Drop } from "@/lib/types";
import { daysAgo, SEED_NOW } from "./helpers";

/**
 * Stacks are the differentiating half of collections: a curated set that can
 * be turned into an install plan and an agent manifest, rather than a list of
 * links. Boards are the personal, private half.
 */

const rawStacks: Omit<Collection, "_id" | "saves" | "createdAt" | "updatedAt">[] = [
  {
    kind: "stack",
    slug: "ship-a-saas-this-weekend",
    name: "Ship a SaaS this weekend",
    description:
      "The shortest credible path from empty repo to something with a login and a paywall. Everything here has a free tier you can launch on.",
    visibility: "public",
    curated: true,
    color: "#6244f5",
    items: [
      { type: "listing", slug: "shadcn-ui", note: "Own the components from day one" },
      { type: "listing", slug: "convex", note: "Database, auth and realtime in one dependency" },
      { type: "listing", slug: "clerk", note: "Swap in if you'd rather not build account UI" },
      { type: "listing", slug: "resend", note: "Transactional email as React" },
      { type: "listing", slug: "posthog", note: "Know whether anyone used it" },
      { type: "component", slug: "shadcn-form", note: "Validation wired up correctly the first time" },
      { type: "component", slug: "vt-empty-state", note: "The screen you'll otherwise design at 3am" },
    ],
  },
  {
    kind: "stack",
    slug: "ai-product-ui",
    name: "AI product UI",
    description:
      "The component vocabulary every model-backed product converges on: a composer, streaming text, model chips, and a way to show a diff.",
    visibility: "public",
    curated: true,
    color: "#d97757",
    items: [
      { type: "component", slug: "vt-prompt-input", note: "Composer with model picker and token count" },
      { type: "component", slug: "mp-text-shimmer", note: "Honest loading state for streamed tokens" },
      { type: "component", slug: "vt-model-badge", note: "Which model, which context window" },
      { type: "component", slug: "vt-diff-view", note: "Show what the agent changed" },
      { type: "listing", slug: "vercel-ai-sdk", note: "One API across providers" },
      { type: "listing", slug: "langfuse", note: "Traces before you need them" },
    ],
  },
  {
    kind: "stack",
    slug: "accessible-by-default",
    name: "Accessible by default",
    description:
      "Pick these and the keyboard and screen-reader work is largely inherited rather than owed. Every entry scores 'audited' on the a11y facet.",
    visibility: "public",
    curated: true,
    color: "#0f8a4d",
    items: [
      { type: "listing", slug: "react-aria", note: "Tested against real assistive tech" },
      { type: "listing", slug: "radix-primitives", note: "The behaviour layer, unstyled" },
      { type: "listing", slug: "base-ui", note: "React 19 from the start" },
      { type: "listing", slug: "wcag-patterns", note: "The reference you check the others against" },
      { type: "listing", slug: "playwright", note: "Assert the keyboard path in CI" },
    ],
  },
  {
    kind: "stack",
    slug: "dashboard-in-a-day",
    name: "Dashboard in a day",
    description:
      "Charts that already look designed, a table that scales, and the tiles that go around them.",
    visibility: "public",
    curated: true,
    color: "#3b82f6",
    items: [
      { type: "listing", slug: "tremor", note: "Analytics-shaped defaults" },
      { type: "listing", slug: "tanstack-table", note: "Table logic, your markup" },
      { type: "component", slug: "recharts-area", note: "The chart you'll use most" },
      { type: "component", slug: "vt-stat-tile", note: "Tiles that don't go ragged" },
      { type: "component", slug: "shadcn-data-table", note: "Sorting and selection already wired" },
    ],
  },
  {
    kind: "stack",
    slug: "zero-runtime-css",
    name: "Zero-runtime CSS",
    description:
      "For teams who want the styling cost to be zero at runtime and are willing to give up style props to get it.",
    visibility: "public",
    curated: true,
    color: "#38bdf8",
    items: [
      { type: "listing", slug: "tailwindcss", note: "The engine" },
      { type: "listing", slug: "daisyui", note: "Semantic classes, no JS at all" },
      { type: "listing", slug: "shadcn-ui", note: "Components you compile, not import" },
      { type: "listing", slug: "lucide", note: "Per-icon imports, nothing wasted" },
    ],
  },
  {
    kind: "stack",
    slug: "rsc-safe",
    name: "RSC-safe picks",
    description:
      "Libraries that render on the server without a 'use client' at the top of half your tree. Filtered straight off the RSC facet.",
    visibility: "public",
    curated: true,
    color: "#0b0b0f",
    items: [
      { type: "listing", slug: "tailwindcss" },
      { type: "listing", slug: "daisyui" },
      { type: "listing", slug: "lucide" },
      { type: "listing", slug: "zod" },
      { type: "listing", slug: "resend" },
      { type: "listing", slug: "fontsource" },
    ],
  },
];

export const seedCollections: Collection[] = rawStacks.map((c, i) => ({
  ...c,
  _id: `collection:${c.slug}`,
  saves: 40 + i * 37,
  createdAt: daysAgo(120 - i * 9),
  updatedAt: daysAgo(3 + i),
}));

/** The Drop — one curated set a day. Retention loop, and the front page's pulse. */
export const seedDrops: Drop[] = [
  {
    date: new Date(SEED_NOW).toISOString().slice(0, 10),
    headline: "Composers, diffs, and the UI of agents",
    note: "Every AI product ends up rebuilding the same four components. Today's set is those four, plus the SDK underneath them.",
    listingSlugs: ["vercel-ai-sdk", "model-context-protocol", "langfuse"],
    componentSlugs: ["vt-prompt-input", "vt-diff-view", "mp-text-shimmer", "vt-model-badge"],
  },
  {
    date: new Date(SEED_NOW - 86_400_000).toISOString().slice(0, 10),
    headline: "Tables that survive real data",
    note: "Headless logic, an enterprise fallback, and the shadcn wiring in between.",
    listingSlugs: ["tanstack-table", "ag-grid", "tremor"],
    componentSlugs: ["shadcn-data-table", "recharts-bar"],
  },
  {
    date: new Date(SEED_NOW - 2 * 86_400_000).toISOString().slice(0, 10),
    headline: "The unstyled layer",
    note: "Three takes on the same idea — behaviour without opinions — from three teams that have each shipped it before.",
    listingSlugs: ["radix-primitives", "base-ui", "ark-ui", "react-aria"],
    componentSlugs: ["radix-dropdown", "radix-accordion", "radix-slider"],
  },
];
