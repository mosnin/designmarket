/**
 * Turning a stack into something you can actually run.
 *
 * Every other directory's "collection" is a list of links: you open six tabs
 * and reassemble the install yourself. A stack here compiles to two artefacts —
 * a plan a human can paste into a terminal, and a manifest an agent can read
 * over MCP without visiting a single page.
 *
 * The rule that makes both trustworthy: nothing is invented. A command exists
 * only because a listing publishes a package or a component ships a real CLI
 * line. Anything we cannot install from a terminal is named in `manual` with
 * the reason, rather than being handed a plausible-looking `npm i` that would
 * 404.
 */

// Relative, not aliased: this module is imported by the Convex function that
// serves the MCP endpoint, and the Convex bundler does not resolve the "@/"
// path alias. One implementation means an agent and a reader get the same
// install plan, which is the whole promise.
import type { Collection, Listing, UIComponent } from "./types";

export type ManualStep = {
  slug: string;
  name: string;
  /** why a terminal cannot do this one */
  why: string;
};

export type InstallPlan = {
  /** ready to paste, in the order you would run them */
  commands: string[];
  /** everything the commands deliberately leave out */
  manual: ManualStep[];
  /** how many of the stack's listings the commands actually cover */
  covered: number;
};

/**
 * Why a listing cannot be installed from a terminal.
 *
 * Ordered from most specific to least: an MCP server is not "no package
 * published", it is a thing you configure, and saying so is more use than a
 * shrug.
 */
function manualReason(listing: Listing): string {
  const install = listing.stack.install;
  switch (listing.kind) {
    case "mcp": {
      const transport = listing.details?.transport;
      const auth = listing.details?.auth;
      const how =
        transport === "http" || transport === "sse"
          ? "Add its URL to your client's MCP config"
          : "Register it as a local command in your client's MCP config";
      return auth ? `${how} — auth: ${auth}` : how;
    }
    case "api":
      return listing.details?.baseUrl
        ? `Nothing to install — call ${listing.details.baseUrl}`
        : "Nothing to install — an HTTP API you authenticate against";
    case "skill":
      return listing.details?.runsIn?.length
        ? `Drop into the skills directory of ${listing.details.runsIn.join(" / ")}`
        : "Drop into your agent's skills directory";
    default:
      break;
  }
  if (install.includes("copy-paste")) {
    return "Copy & paste — the source goes into your repo, not node_modules";
  }
  if (install.includes("cdn")) {
    return "Hosted — link the CDN build or point at the service";
  }
  if (install.includes("cli")) {
    return "Has its own CLI — run it once per component you want";
  }
  if (listing.repo && !listing.npm) return "Not on npm — clone or vendor the repo";
  return "No package published — follow its own docs";
}

/**
 * One `npm i` beats six. Packages are batched into a single command because
 * that is what you would actually type; component CLI lines stay separate
 * because each one writes different files.
 */
export function buildInstallPlan(
  listings: Listing[],
  components: UIComponent[]
): InstallPlan {
  const packages: string[] = [];
  const manual: ManualStep[] = [];

  for (const listing of listings) {
    if (listing.npm) {
      if (!packages.includes(listing.npm)) packages.push(listing.npm);
    } else {
      manual.push({
        slug: listing.slug,
        name: listing.name,
        why: manualReason(listing),
      });
    }
  }

  const commands: string[] = [];
  if (packages.length) commands.push(`npm i ${packages.join(" ")}`);

  for (const component of components) {
    const line = component.installCommand?.trim();
    if (line && !commands.includes(line)) commands.push(line);
  }

  return { commands, manual, covered: packages.length };
}

/* ------------------------------------------------------------------ agents */

type ManifestListing = {
  slug: string;
  name: string;
  kind: string;
  tagline: string;
  license: string;
  pricing: string;
  install: string[];
  package?: string;
  version?: string;
  weeklyDownloads?: number;
  repo?: string;
  docs?: string;
  homepage?: string;
  requires?: Record<string, unknown>;
  mcp?: { transport?: string; auth?: string; tools?: string[] };
  api?: { baseUrl?: string; auth?: string; rateLimit?: string; openapi?: boolean };
  skill?: { trigger?: string; runsIn?: string[] };
  note?: string;
};

export type AgentManifest = {
  stack: string;
  name: string;
  description: string;
  install: { commands: string[]; manual: ManualStep[] };
  requires: { react?: string; frameworks?: string[]; styling?: string[] };
  licenses: string[];
  listings: ManifestListing[];
  components?: Array<{
    slug: string;
    name: string;
    from: string;
    install?: string;
    import?: string;
    deps?: string[];
  }>;
};

/** Drop keys whose value we could not verify, so absence reads as absence. */
function prune<T extends Record<string, unknown>>(value: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(value)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) {
      continue;
    }
    out[key] = v;
  }
  return out as T;
}

/** "19" wins over "18" wins over "any" — the strictest constraint in the set. */
function strictestReact(listings: Listing[]): string | undefined {
  const rank: Record<string, number> = { any: 0, "18": 1, "19": 2 };
  let best: string | undefined;
  for (const listing of listings) {
    const value = listing.stack.react;
    if (!value) continue;
    if (best === undefined || (rank[value] ?? 0) > (rank[best] ?? 0)) best = value;
  }
  return best;
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

/**
 * The payload an agent gets when it asks for a stack over MCP.
 *
 * It is deliberately the same shape as what the page renders: if a human can
 * see it, an agent can fetch it, and neither gets a number the other doesn't.
 */
export function buildAgentManifest(
  stack: Collection,
  listings: Listing[],
  components: UIComponent[]
): AgentManifest {
  const notes: Record<string, string> = {};
  for (const item of stack.items) {
    if (item.note) notes[item.slug] = item.note;
  }

  const plan = buildInstallPlan(listings, components);
  const react = strictestReact(listings);

  const manifest: AgentManifest = {
    stack: stack.slug,
    name: stack.name,
    description: stack.description,
    install: { commands: plan.commands, manual: plan.manual },
    requires: prune({
      react,
      frameworks: unique(listings.flatMap((l) => l.stack.frameworks)),
      styling: unique(listings.flatMap((l) => l.stack.styling)),
    }),
    licenses: unique(listings.map((l) => l.license)),
    listings: listings.map((listing) =>
      prune<ManifestListing>({
        slug: listing.slug,
        name: listing.name,
        kind: listing.kind,
        tagline: listing.tagline,
        license: listing.license,
        pricing: listing.pricing,
        install: listing.stack.install,
        package: listing.npm,
        version: listing.facts.version,
        weeklyDownloads: listing.facts.weeklyDownloads,
        repo: listing.repo,
        docs: listing.docs,
        homepage: listing.homepage,
        requires: prune({
          react: listing.stack.react === "any" ? undefined : listing.stack.react,
          rsc: listing.stack.rsc,
          typescript: listing.stack.typescript || undefined,
        }),
        mcp:
          listing.kind === "mcp"
            ? prune({
                transport: listing.details?.transport,
                auth: listing.details?.auth,
                tools: listing.details?.tools,
              })
            : undefined,
        api:
          listing.kind === "api"
            ? prune({
                baseUrl: listing.details?.baseUrl,
                auth: listing.details?.auth,
                rateLimit: listing.details?.rateLimit,
                openapi: listing.details?.openapi,
              })
            : undefined,
        skill:
          listing.kind === "skill"
            ? prune({
                trigger: listing.details?.trigger,
                runsIn: listing.details?.runsIn,
              })
            : undefined,
        note: notes[listing.slug],
      })
    ),
  };

  if (components.length) {
    manifest.components = components.map((component) =>
      prune({
        slug: component.slug,
        name: component.name,
        from: component.listingSlug,
        install: component.installCommand,
        import: component.importLine,
        deps: component.deps,
      })
    );
  }

  return manifest;
}
