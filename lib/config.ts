/**
 * Single source of truth for product identity. Renaming the product is a
 * one-line change here plus the wordmark in `components/brand/logo.tsx`.
 */
/**
 * `??` only catches `undefined`. A variable that is *declared and empty* — which
 * is what a blank field in the Vercel dashboard produces — sails straight
 * through it, and `new URL("")` in `lib/metadata.ts` then throws
 * ERR_INVALID_URL while Next collects page data. That crashes the build on
 * `/_not-found` before a single route renders, with a stack pointing at
 * metadata rather than at the empty variable. Trim first, then fall back.
 */
function env(name: string): string | undefined {
  // Next inlines `process.env.X` at build time only for a literal member
  // expression, so the candidates are spelled out rather than looked up.
  const raw = {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  }[name];
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Absolute, scheme-qualified origin for canonical URLs, Open Graph and the
 * sitemap. Vercel supplies its own host without a scheme, so add one.
 */
function resolveSiteUrl(): string {
  const explicit = env("NEXT_PUBLIC_SITE_URL");
  // Preview and production deployments both get a real origin for free, which
  // beats every preview claiming to be the production domain.
  const vercel =
    env("NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL") ?? env("NEXT_PUBLIC_VERCEL_URL");

  for (const candidate of [explicit, vercel]) {
    if (!candidate) continue;
    // Vercel supplies a bare host; a hand-set variable usually has a scheme.
    const withScheme = /^https?:\/\//.test(candidate) ? candidate : `https://${candidate}`;
    // A misconfigured variable must not be able to fail the build. Metadata is
    // the wrong place to discover that — it would take down every route.
    try {
      return new URL(withScheme).origin;
    } catch {
      console.warn(`[config] ignoring unparseable site URL: ${JSON.stringify(candidate)}`);
    }
  }
  return "https://vitrine.dev";
}

export const siteConfig = {
  name: "Vitrine",
  tagline: "Every component, running.",
  description:
    "A free marketplace for AI-era UI. Every component renders live, in your design tokens — and your coding agent can shop here too.",
  url: resolveSiteUrl(),
  twitter: "@vitrinedev",
  github: "https://github.com/mosnin/designmarket",
} as const;

/** Feature switches carried over from the purchased theme. */
export const features = {
  /** Lenis smooth scrolling on marketing surfaces only — never in the app,
   *  where hijacking the scroll fights the sidebar and the preview frames. */
  smoothScroll: true,
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
