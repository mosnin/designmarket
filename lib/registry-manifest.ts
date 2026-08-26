/**
 * The keys the render layer can actually run.
 *
 * Plain data on purpose: server code needs to know whether a component is
 * genuinely renderable without pulling Recharts and Motion into the server
 * bundle. `components/registry/index.tsx` asserts that it implements exactly
 * this list, so the two can never disagree — a component claiming
 * `previewMode: "registry"` with no implementation would otherwise render an
 * empty box while the card promised "LIVE", which is precisely the dishonesty
 * this marketplace exists to avoid.
 */
export const REGISTRY_KEYS = [
  // shadcn/ui, over the Radix packages vendored into the sandbox
  "shadcn/button",
  "shadcn/badge",
  "shadcn/card",
  "shadcn/avatar",
  "shadcn/dialog",
  "shadcn/tabs",
  "shadcn/select",
  "shadcn/command",
  "shadcn/combobox",
  "shadcn/toast",
  "shadcn/form",
  "shadcn/data-table",
  "shadcn/input-otp",
  "shadcn/progress",
  "shadcn/checkbox",
  "shadcn/radio-group",
  "shadcn/hover-card",
  "shadcn/collapsible",
  "shadcn/context-menu",
  "shadcn/toggle-group",

  // Radix primitives, unstyled behaviour with our own skin
  "radix/tooltip",
  "radix/accordion",
  "radix/dropdown",
  "radix/slider",
  "radix/switch",

  // Recharts and Tremor-shaped charts
  "recharts/area",
  "recharts/bar",
  "recharts/line",
  "recharts/pie",
  "recharts/radial",
  "tremor/kpi",
  "tremor/sparkline",

  // Motion
  "motion/layout-list",
  "motion/shared-element",
  "magic/marquee",
  "magic/number-ticker",
  "magic/grid-pattern",
  "mp/text-shimmer",
  "mp/cursor",
] as const;

export type RegistryKey = (typeof REGISTRY_KEYS)[number];

const KEY_SET: ReadonlySet<string> = new Set(REGISTRY_KEYS);

export function isRegistryKey(key: string | undefined): key is RegistryKey {
  return key !== undefined && KEY_SET.has(key);
}

/**
 * Whether a component record can actually be rendered right now. A record can
 * claim registry mode, but if nothing implements its key it links out instead.
 */
/**
 * Registry keys read well ("shadcn/button") but a slash inside a single path
 * segment gets encoded, then decoded again by the router, and the round trip
 * is not reliably lossless. The preview route uses a flat form instead.
 */
export function keyToSlug(key: string): string {
  return key.replace(/\//g, "--");
}

export function slugToKey(slug: string): string {
  return slug.replace(/--/g, "/");
}

export function canRender(component: {
  previewMode: string;
  registryKey?: string | undefined;
}): boolean {
  if (component.previewMode === "compiled") return true;
  return component.previewMode === "registry" && isRegistryKey(component.registryKey);
}
