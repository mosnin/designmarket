/**
 * THE VITRINE TAXONOMY
 *
 * Three axes, deliberately kept separate so the catalogue can grow to Product
 * Hunt scale without the navigation collapsing:
 *
 *  1. SECTIONS answer "what part of the market am I in?" — UI, Tools, MCP,
 *     Skills, APIs, Repos. A section is the unit of navigation: the master rail
 *     switches between them and the sidebar is rebuilt from the section's own
 *     categories. Nothing renders a list of every category in the catalogue.
 *
 *  2. CATEGORIES answer "what kind of thing is this?" Each belongs to exactly
 *     one section, so a sidebar is a lookup rather than a filter over
 *     everything, and adding a thousand listings to Tools never lengthens the
 *     UI sidebar by a single row.
 *
 *  3. FACETS answer "will it work in my repo?" — orthogonal to both, and the
 *     thing nobody else indexes.
 */

/* ==========================================================================
   SECTIONS — the master rail
   ========================================================================== */

export type SectionId =
  | "explore"
  | "ui"
  | "tools"
  | "mcp"
  | "skills"
  | "apis"
  | "repos"
  | "stacks"
  | "drop"
  | "compare";

export type ListingKindId =
  | "library"
  | "tool"
  | "resource"
  | "mcp"
  | "skill"
  | "api"
  | "repo";

export type Section = {
  id: SectionId;
  label: string;
  /** the rail is 4.5rem wide; this is what fits */
  short: string;
  /** lucide icon name */
  icon: string;
  href: string;
  blurb: string;
  /** listing kinds this section shows; empty means "not a listing browser" */
  kinds: ListingKindId[];
  /** the section owns a category sidebar */
  hasCategories: boolean;
  /** show the live dot — this section renders things */
  live?: boolean;
};

export const sections: readonly Section[] = [
  {
    id: "explore",
    label: "Explore",
    short: "Explore",
    icon: "Compass",
    href: "/explore",
    blurb: "Everything in the catalogue, across every section.",
    kinds: [],
    hasCategories: false,
  },
  {
    id: "ui",
    label: "UI & Design",
    short: "UI",
    icon: "Component",
    href: "/ui",
    blurb: "Component libraries, design systems and the components inside them — rendered live.",
    kinds: ["library", "resource"],
    hasCategories: true,
    live: true,
  },
  {
    id: "tools",
    label: "Tools",
    short: "Tools",
    icon: "Sparkles",
    href: "/tools",
    blurb: "AI and software tools, the way a product directory lists them.",
    kinds: ["tool"],
    hasCategories: true,
  },
  {
    id: "mcp",
    label: "MCP Servers",
    short: "MCP",
    icon: "Plug",
    href: "/mcp",
    blurb: "Tools your agent can pick up, with the transport and auth spelled out.",
    kinds: ["mcp"],
    hasCategories: true,
  },
  {
    id: "skills",
    label: "Skills",
    short: "Skills",
    icon: "GraduationCap",
    href: "/skills",
    blurb: "Packaged instructions that teach an agent to do one job properly.",
    kinds: ["skill"],
    hasCategories: true,
  },
  {
    id: "apis",
    label: "APIs",
    short: "APIs",
    icon: "Webhook",
    href: "/apis",
    blurb: "Public APIs worth wiring up, with auth model and pricing up front.",
    kinds: ["api"],
    hasCategories: true,
  },
  {
    id: "repos",
    label: "Repositories",
    short: "Repos",
    icon: "GitFork",
    href: "/repos",
    blurb: "Open-source repositories worth reading, cloning or stealing from.",
    kinds: ["repo"],
    hasCategories: true,
  },
  {
    id: "stacks",
    label: "Stacks",
    short: "Stacks",
    icon: "LayoutList",
    href: "/stacks",
    blurb: "Curated sets that are actually installable.",
    kinds: [],
    hasCategories: false,
  },
  {
    id: "drop",
    label: "The Drop",
    short: "Drop",
    icon: "CalendarDays",
    href: "/drop",
    blurb: "One curated set a day.",
    kinds: [],
    hasCategories: false,
  },
  {
    id: "compare",
    label: "Compare",
    short: "Compare",
    icon: "Columns3",
    href: "/compare",
    blurb: "Render candidates side by side.",
    kinds: [],
    hasCategories: false,
  },
] as const;

export const sectionById: ReadonlyMap<SectionId, Section> = new Map(
  sections.map((s) => [s.id, s])
);

/** Sections that browse listings, in rail order. */
export const browsableSections = sections.filter((s) => s.kinds.length > 0);

export function sectionForKind(kind: string): Section | undefined {
  return sections.find((s) => s.kinds.includes(kind as ListingKindId));
}

/* ==========================================================================
   CATEGORY GROUPS — the second level inside a section's sidebar
   ========================================================================== */

export type CategoryGroup = {
  id: string;
  section: SectionId;
  name: string;
};

export const categoryGroups: readonly CategoryGroup[] = [
  { id: "ui-components", section: "ui", name: "Components" },
  { id: "ui-assets", section: "ui", name: "Assets" },
  { id: "ui-craft", section: "ui", name: "Craft" },

  { id: "tools-ai", section: "tools", name: "AI" },
  { id: "tools-work", section: "tools", name: "Work" },
  { id: "tools-build", section: "tools", name: "Build" },
  { id: "tools-create", section: "tools", name: "Create" },

  { id: "mcp-kind", section: "mcp", name: "By capability" },
  { id: "skills-kind", section: "skills", name: "By job" },
  { id: "apis-kind", section: "apis", name: "By domain" },
  { id: "repos-kind", section: "repos", name: "By shape" },
] as const;

/* ==========================================================================
   CATEGORIES
   ========================================================================== */

export type Category = {
  slug: string;
  name: string;
  section: SectionId;
  group: string;
  /** lucide-react icon name, resolved by `components/category-icon.tsx` */
  icon: string;
  blurb: string;
  /** listings here are expected to have renderable components */
  renderable?: boolean;
};

const c = (
  slug: string,
  name: string,
  section: SectionId,
  group: string,
  icon: string,
  blurb: string,
  renderable?: boolean
): Category => ({
  slug,
  name,
  section,
  group,
  icon,
  blurb,
  ...(renderable ? { renderable } : {}),
});

export const categories: readonly Category[] = [
  /* ------------------------------------------------------------ UI & DESIGN */
  c("component-libraries", "Component Libraries", "ui", "ui-components", "Boxes", "Full kits of ready components.", true),
  c("design-systems", "Design Systems", "ui", "ui-components", "Layers", "Tokens, primitives and the rules that bind them.", true),
  c("headless-primitives", "Headless Primitives", "ui", "ui-components", "Component", "Behaviour and a11y without opinions on looks.", true),
  c("blocks-sections", "Blocks & Sections", "ui", "ui-components", "LayoutTemplate", "Page-sized chunks you paste in.", true),
  c("forms-inputs", "Forms & Inputs", "ui", "ui-components", "TextCursorInput", "Fields, validation, multi-step flows.", true),
  c("tables-grids", "Tables & Data Grids", "ui", "ui-components", "Table2", "Sorting, virtualisation, editable cells.", true),
  c("charts-dataviz", "Charts & Data Viz", "ui", "ui-components", "ChartSpline", "Plot things without fighting D3.", true),
  c("animation-motion", "Animation & Motion", "ui", "ui-components", "Sparkles", "Springs, transitions, scroll effects.", true),
  c("3d-webgl", "3D & WebGL", "ui", "ui-components", "Box", "Shaders, scenes and GPU-flavoured UI.", true),
  c("dashboard-kits", "Dashboard Kits", "ui", "ui-components", "LayoutDashboard", "Admin shells with the boring parts done.", true),
  c("landing-kits", "Landing Page Kits", "ui", "ui-components", "Rocket", "Marketing pages that already convert.", true),
  c("templates-starters", "Templates & Starters", "ui", "ui-components", "FileCode2", "Whole repos to clone.", true),
  c("micro-interactions", "Micro-interactions", "ui", "ui-components", "MousePointerClick", "Cursors, hovers, the small delightful stuff.", true),
  c("email-templates", "Email Templates", "ui", "ui-components", "Mail", "HTML that survives Outlook."),

  c("icons", "Icons", "ui", "ui-assets", "Shapes", "Icon sets, sized and licensed properly."),
  c("illustrations", "Illustrations", "ui", "ui-assets", "Brush", "Vector art you can actually ship."),
  c("fonts-type", "Fonts & Type", "ui", "ui-assets", "Type", "Typefaces and typographic scales."),
  c("color-palettes", "Color & Palettes", "ui", "ui-assets", "Palette", "Ramps, contrast checkers, theme generators."),
  c("backgrounds-patterns", "Backgrounds & Patterns", "ui", "ui-assets", "Grid2x2", "Gradients, meshes, noise, grids.", true),
  c("mockups", "Mockups & Devices", "ui", "ui-assets", "Smartphone", "Frames for showing your work off."),
  c("figma-resources", "Figma Resources", "ui", "ui-assets", "Figma", "Kits, plugins and token bridges."),

  c("accessibility", "Accessibility", "ui", "ui-craft", "Accessibility", "Audits, linters and patterns that pass."),
  c("design-engineering", "Design Engineering", "ui", "ui-craft", "Ruler", "The seam between Figma and main."),
  c("documentation", "Documentation", "ui", "ui-craft", "BookOpen", "Docs sites and API reference generators."),
  c("inspiration", "Inspiration", "ui", "ui-craft", "Eye", "Portfolios, galleries, awwwards bait."),

  /* ----------------------------------------------------------------- TOOLS */
  c("ai-design-tools", "AI Design", "tools", "tools-ai", "Wand2", "Prompt to mockup, mockup to code."),
  c("ai-coding-agents", "AI Coding Agents", "tools", "tools-ai", "Bot", "Agents that write and run code."),
  c("agent-frameworks", "Agent Frameworks", "tools", "tools-ai", "Workflow", "Orchestration, memory, tool loops."),
  c("prompt-tools", "Prompt Tools", "tools", "tools-ai", "MessageSquareCode", "Versioning, testing and sharing prompts."),
  c("llm-infrastructure", "LLM Infrastructure", "tools", "tools-ai", "Server", "Gateways, routing, caching, serving."),
  c("rag-vector", "RAG & Vector DBs", "tools", "tools-ai", "Database", "Chunking, embedding, retrieval."),
  c("evals-observability", "Evals & Observability", "tools", "tools-ai", "Gauge", "Know whether your model got worse."),
  c("fine-tuning", "Fine-tuning", "tools", "tools-ai", "SlidersHorizontal", "Adapters, datasets, training runs."),

  c("coding", "Coding", "tools", "tools-work", "Code", "Editors, terminals and the tools around them."),
  c("productivity", "Productivity", "tools", "tools-work", "Zap", "Notes, tasks, calendars, focus."),
  c("writing", "Writing", "tools", "tools-work", "PenLine", "Drafting, editing and publishing."),
  c("research", "Research", "tools", "tools-work", "Microscope", "Reading, searching, summarising, citing."),
  c("education", "Education", "tools", "tools-work", "GraduationCap", "Courses, tutors and practice."),
  c("finance", "Finance", "tools", "tools-work", "CircleDollarSign", "Accounting, invoicing, modelling."),
  c("sales-marketing", "Sales & Marketing", "tools", "tools-work", "Megaphone", "Outbound, CRM, SEO, campaigns."),
  c("social-media", "Social Media", "tools", "tools-work", "AtSign", "Scheduling, analytics, community."),
  c("newsletters", "Newsletters", "tools", "tools-work", "MailOpen", "Writing, sending and growing a list."),
  c("customer-support", "Customer Support", "tools", "tools-work", "LifeBuoy", "Inboxes, help centres, deflection."),
  c("security", "Security", "tools", "tools-work", "Lock", "Secrets, scanning, compliance."),
  c("e-commerce", "E-commerce", "tools", "tools-work", "ShoppingCart", "Storefronts, checkout, catalogues."),

  c("frameworks", "Frameworks", "tools", "tools-build", "Frame", "The thing your app is written in."),
  c("css-styling", "CSS & Styling", "tools", "tools-build", "Paintbrush", "Utility engines, CSS-in-JS, preprocessors."),
  c("state-management", "State Management", "tools", "tools-build", "Share2", "Stores, signals, machines."),
  c("auth", "Auth", "tools", "tools-build", "KeyRound", "Sessions, OAuth, passkeys."),
  c("databases", "Databases", "tools", "tools-build", "HardDrive", "Relational, document, edge and otherwise."),
  c("backends-baas", "Backends & BaaS", "tools", "tools-build", "Cloud", "Batteries-included backends."),
  c("hosting-deploy", "Hosting & Deploy", "tools", "tools-build", "UploadCloud", "Where it runs in production."),
  c("analytics", "Analytics", "tools", "tools-build", "TrendingUp", "Product, web and error analytics."),
  c("payments", "Payments", "tools", "tools-build", "CreditCard", "Checkout, subscriptions, billing."),
  c("email-messaging", "Email & Messaging", "tools", "tools-build", "Send", "Transactional email, SMS, push."),
  c("search", "Search", "tools", "tools-build", "Search", "Full text, hybrid, typo-tolerant."),
  c("cms", "CMS", "tools", "tools-build", "FileText", "Content modelling for people who aren't you."),
  c("testing", "Testing", "tools", "tools-build", "FlaskConical", "Unit, e2e, visual regression."),
  c("devtools", "DevTools", "tools", "tools-build", "Terminal", "CLIs, editors, local tooling."),
  c("performance", "Performance", "tools", "tools-build", "Rocket", "Bundle budgets, profiling, Core Web Vitals."),
  c("no-code", "No-code", "tools", "tools-build", "Blocks", "Build without writing it."),

  c("image-generation", "Image", "tools", "tools-create", "Image", "Diffusion models and the apps around them."),
  c("video-generation", "Video", "tools", "tools-create", "Clapperboard", "Text to video, editing, upscaling."),
  c("audio-voice", "Audio & Voice", "tools", "tools-create", "AudioLines", "TTS, transcription, music."),
  c("photography", "Photography", "tools", "tools-create", "Camera", "Capture, edit, organise, publish."),
  c("3d-modeling", "3D", "tools", "tools-create", "Boxes", "Modelling, rendering and scene tools."),

  /* ----------------------------------------------------------------- MCP */
  c("mcp-dev", "Developer Tools", "mcp", "mcp-kind", "Terminal", "Repos, builds, CI, code search."),
  c("mcp-data", "Data & Databases", "mcp", "mcp-kind", "Database", "Query, inspect and mutate data stores."),
  c("mcp-search", "Search & Web", "mcp", "mcp-kind", "Globe", "Fetching, scraping, indexing the open web."),
  c("mcp-browser", "Browser & Automation", "mcp", "mcp-kind", "MousePointerClick", "Driving a real browser from an agent."),
  c("mcp-design", "Design", "mcp", "mcp-kind", "Palette", "Figma, assets, design tokens."),
  c("mcp-productivity", "Productivity", "mcp", "mcp-kind", "CheckSquare", "Issues, docs, calendars, messaging."),
  c("mcp-cloud", "Cloud & Infra", "mcp", "mcp-kind", "Cloud", "Deployments, logs, infrastructure."),
  c("mcp-payments", "Commerce", "mcp", "mcp-kind", "CreditCard", "Payments, catalogues, orders."),
  c("mcp-memory", "Memory & Knowledge", "mcp", "mcp-kind", "Brain", "Long-term memory and retrieval for agents."),

  /* --------------------------------------------------------------- SKILLS */
  c("skills-coding", "Coding", "skills", "skills-kind", "Code", "Reviewing, refactoring, migrating, debugging."),
  c("skills-writing", "Writing", "skills", "skills-kind", "PenLine", "Drafting in a voice, editing, summarising."),
  c("skills-documents", "Documents", "skills", "skills-kind", "FileText", "Spreadsheets, slides, PDFs, Word."),
  c("skills-design", "Design", "skills", "skills-kind", "Palette", "Design systems, diagrams, visual output."),
  c("skills-data", "Data", "skills", "skills-kind", "ChartSpline", "Analysis, cleaning, visualising, reporting."),
  c("skills-research", "Research", "skills", "skills-kind", "Microscope", "Searching, reading, synthesising, citing."),
  c("skills-ops", "Ops & Workflow", "skills", "skills-kind", "Workflow", "Deploys, incidents, recurring processes."),

  /* ----------------------------------------------------------------- APIS */
  c("api-payments", "Payments", "apis", "apis-kind", "CreditCard", "Charges, subscriptions, payouts."),
  c("api-email", "Email & SMS", "apis", "apis-kind", "Send", "Transactional delivery and messaging."),
  c("api-ai", "AI & Models", "apis", "apis-kind", "Bot", "Inference, embeddings, moderation."),
  c("api-data", "Data & Enrichment", "apis", "apis-kind", "Database", "Company, people, financial and reference data."),
  c("api-maps", "Maps & Places", "apis", "apis-kind", "MapPin", "Geocoding, routing, places."),
  c("api-media", "Media", "apis", "apis-kind", "Image", "Images, video, audio, transformation."),
  c("api-auth", "Identity", "apis", "apis-kind", "KeyRound", "Auth, verification, fraud."),
  c("api-dev", "Developer", "apis", "apis-kind", "Terminal", "Repos, packages, CI, observability."),

  /* ---------------------------------------------------------------- REPOS */
  c("repo-frameworks", "Frameworks & Runtimes", "repos", "repos-kind", "Frame", "The big ones, worth reading the source of."),
  c("repo-libraries", "Libraries", "repos", "repos-kind", "Boxes", "Focused packages that do one thing."),
  c("repo-cli", "CLI & DevTools", "repos", "repos-kind", "Terminal", "Command-line tools and local tooling."),
  c("repo-ai", "AI & Agents", "repos", "repos-kind", "Bot", "Model tooling, agent frameworks, inference."),
  c("repo-starters", "Starters & Boilerplates", "repos", "repos-kind", "FileCode2", "Clone and go."),
  c("repo-awesome", "Awesome Lists", "repos", "repos-kind", "ListChecks", "Curated indexes of a whole field."),
  c("repo-learning", "Learning & Reference", "repos", "repos-kind", "BookOpen", "Books, courses and specs kept in git."),
] as const;

export const categoryBySlug: ReadonlyMap<string, Category> = new Map(
  categories.map((cat) => [cat.slug, cat])
);

/** Categories belonging to a section, already grouped for the sidebar. */
export function categoriesForSection(
  section: SectionId
): { group: CategoryGroup; items: Category[] }[] {
  return categoryGroups
    .filter((g) => g.section === section)
    .map((group) => ({
      group,
      items: categories.filter((cat) => cat.group === group.id),
    }))
    .filter((entry) => entry.items.length > 0);
}

export function sectionForCategory(slug: string): Section | undefined {
  const category = categoryBySlug.get(slug);
  return category ? sectionById.get(category.section) : undefined;
}

/* ==========================================================================
   FACETS — the Stack Compatibility Graph
   ========================================================================== */

export type FacetOption = { value: string; label: string; hint?: string };

export type Facet = {
  id: string;
  label: string;
  short: string;
  multi: boolean;
  options: readonly FacetOption[];
  /** sections this facet is meaningful in; empty means all */
  sections?: SectionId[];
};

export const facets: readonly Facet[] = [
  {
    id: "framework",
    label: "Framework",
    short: "Framework",
    multi: true,
    sections: ["ui", "tools", "repos"],
    options: [
      { value: "react", label: "React" },
      { value: "next", label: "Next.js" },
      { value: "remix", label: "React Router / Remix" },
      { value: "vite", label: "Vite" },
      { value: "astro", label: "Astro" },
      { value: "vue", label: "Vue" },
      { value: "svelte", label: "Svelte" },
      { value: "solid", label: "Solid" },
      { value: "angular", label: "Angular" },
      { value: "vanilla", label: "No framework" },
    ],
  },
  {
    id: "styling",
    label: "Styling",
    short: "Styling",
    multi: true,
    sections: ["ui"],
    options: [
      { value: "tailwind-4", label: "Tailwind v4" },
      { value: "tailwind-3", label: "Tailwind v3" },
      { value: "css-modules", label: "CSS Modules" },
      { value: "css-in-js", label: "CSS-in-JS" },
      { value: "vanilla-css", label: "Plain CSS" },
      { value: "unstyled", label: "Unstyled" },
    ],
  },
  {
    id: "react",
    label: "React version",
    short: "React",
    multi: false,
    sections: ["ui"],
    options: [
      { value: "19", label: "React 19", hint: "Supports the current major" },
      { value: "18", label: "React 18+" },
      { value: "any", label: "Any / N/A" },
    ],
  },
  {
    id: "rsc",
    label: "Server Components",
    short: "RSC",
    multi: false,
    sections: ["ui"],
    options: [
      { value: "safe", label: "RSC-safe", hint: "Renders on the server without 'use client'" },
      { value: "client", label: "Client only" },
      { value: "mixed", label: "Mixed" },
    ],
  },
  {
    id: "license",
    label: "License",
    short: "License",
    multi: true,
    options: [
      { value: "mit", label: "MIT" },
      { value: "apache-2.0", label: "Apache 2.0" },
      { value: "bsd-3", label: "BSD 3-Clause" },
      { value: "gpl", label: "GPL family", hint: "Copyleft — check before shipping" },
      { value: "commercial", label: "Commercial" },
      { value: "free-personal", label: "Free for personal use" },
    ],
  },
  {
    id: "pricing",
    label: "Pricing",
    short: "Pricing",
    multi: true,
    options: [
      { value: "free", label: "Free" },
      { value: "open-source", label: "Open source" },
      { value: "freemium", label: "Freemium" },
      { value: "paid", label: "Paid" },
      { value: "trial", label: "Free trial" },
    ],
  },
  {
    id: "typescript",
    label: "TypeScript",
    short: "TS",
    multi: false,
    sections: ["ui", "tools", "repos"],
    options: [
      { value: "yes", label: "Ships types" },
      { value: "no", label: "No types" },
    ],
  },
  {
    id: "a11y",
    label: "Accessibility",
    short: "A11y",
    multi: false,
    sections: ["ui"],
    options: [
      { value: "audited", label: "Audited", hint: "Documented keyboard + SR support" },
      { value: "partial", label: "Partial" },
      { value: "unknown", label: "Unknown" },
    ],
  },
  {
    id: "install",
    label: "Install method",
    short: "Install",
    multi: true,
    sections: ["ui", "tools", "repos"],
    options: [
      { value: "npm", label: "npm package" },
      { value: "copy-paste", label: "Copy & paste" },
      { value: "cli", label: "CLI (shadcn-style)" },
      { value: "cdn", label: "CDN / hosted" },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    short: "Transport",
    multi: true,
    sections: ["mcp"],
    options: [
      { value: "stdio", label: "stdio", hint: "Runs locally as a subprocess" },
      { value: "http", label: "Streamable HTTP", hint: "Hosted, reachable over the network" },
      { value: "sse", label: "SSE" },
      { value: "both", label: "Either" },
    ],
  },
  {
    id: "authmode",
    label: "Authentication",
    short: "Auth",
    multi: true,
    sections: ["mcp", "apis"],
    options: [
      { value: "none", label: "None", hint: "Nothing to configure" },
      { value: "token", label: "API key or token" },
      { value: "oauth", label: "OAuth" },
    ],
  },
] as const;

export const facetById: ReadonlyMap<string, Facet> = new Map(
  facets.map((f) => [f.id, f])
);

/** Only the facets that mean anything in this section. */
export function facetsForSection(section: SectionId | undefined): Facet[] {
  if (!section) return [...facets];
  return facets.filter((f) => !f.sections || f.sections.includes(section));
}

export function facetOptionLabel(facetId: string, value: string): string {
  return (
    facetById.get(facetId)?.options.find((o) => o.value === value)?.label ?? value
  );
}

/* ==========================================================================
   COMPONENT KINDS — the component-level index
   ========================================================================== */

export const componentKinds = [
  "button", "input", "select", "checkbox", "radio", "switch", "slider",
  "textarea", "combobox", "date-picker", "date-range", "file-upload",
  "form", "otp", "color-picker", "rating",
  "card", "avatar", "badge", "table", "data-grid", "list", "tree",
  "tabs", "accordion", "dialog", "drawer", "popover", "tooltip", "dropdown",
  "command", "context-menu", "navbar", "sidebar", "breadcrumb", "pagination",
  "stepper", "toast", "alert", "progress", "skeleton", "spinner", "empty-state",
  "chart", "sparkline", "stat", "kanban", "calendar", "timeline",
  "hero", "pricing", "testimonial", "faq", "footer", "cta", "feature-grid",
  "carousel", "gallery", "marquee", "cursor", "background", "text-effect",
  "code-block", "terminal", "diff", "editor", "chat", "prompt-input",
] as const;

export type ComponentKind = (typeof componentKinds)[number];

export function componentKindLabel(kind: string): string {
  return kind
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
