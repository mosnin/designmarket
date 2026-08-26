/**
 * Single source of truth for product identity. Renaming the product is a
 * one-line change here plus the wordmark in `components/brand/logo.tsx`.
 */
export const siteConfig = {
  name: "Vitrine",
  tagline: "Every component, running.",
  description:
    "A free marketplace for AI-era UI. Every component renders live, in your design tokens — and your coding agent can shop here too.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitrine.dev",
  twitter: "@vitrinedev",
  github: "https://github.com/mosnin/designmarket",
} as const;

export const PRO_PRICE_USD = 9;

export const proFeatures = [
  "MCP server — your agents search and install from the whole index",
  "API keys with scoped access and usage logs",
  "Unlimited private boards",
  "Bulk install plans for whole stacks",
  "Compatibility API — ask 'does this work with my stack?' in CI",
  "Early access to new registries",
] as const;

export const freeFeatures = [
  "Browse and render every component, logged out",
  "Copy code and install commands",
  "Bookmarks and public boards",
  "Theme Morph — preview in your own tokens",
  "Submit libraries, components and tools",
  "Remix components and save variants",
] as const;
