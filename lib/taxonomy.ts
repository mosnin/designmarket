/**
 * The Vitrine taxonomy.
 *
 * Two orthogonal axes, deliberately:
 *  - CATEGORIES answer "what kind of thing is this?" (Product Hunt breadth)
 *  - FACETS answer "will it work in my repo?" (the thing nobody else indexes)
 *
 * Both are static here so they can be rendered server-side with zero queries,
 * and are mirrored into Convex at seed time for counting.
 */

export type CategoryGroupId = "ui" | "ai" | "build" | "craft";

export type CategoryGroup = {
  id: CategoryGroupId;
  name: string;
  blurb: string;
};

export const categoryGroups: readonly CategoryGroup[] = [
  {
    id: "ui",
    name: "UI & Design",
    blurb: "Things you look at. Most of these render live.",
  },
  {
    id: "ai",
    name: "AI",
    blurb: "Models, agents, and the plumbing around them.",
  },
  {
    id: "build",
    name: "Build",
    blurb: "The rest of the stack you ship on.",
  },
  {
    id: "craft",
    name: "Craft",
    blurb: "How well the thing is made.",
  },
] as const;

export type Category = {
  slug: string;
  name: string;
  group: CategoryGroupId;
  /** lucide-react icon name, resolved by `components/category-icon.tsx` */
  icon: string;
  blurb: string;
  /** true when listings here are expected to have renderable components */
  renderable?: boolean;
};

export const categories: readonly Category[] = [
  // ---------------------------------------------------------------- UI
  { slug: "component-libraries", name: "Component Libraries", group: "ui", icon: "Boxes", blurb: "Full kits of ready components.", renderable: true },
  { slug: "design-systems", name: "Design Systems", group: "ui", icon: "Layers", blurb: "Tokens, primitives and the rules that bind them.", renderable: true },
  { slug: "headless-primitives", name: "Headless Primitives", group: "ui", icon: "Component", blurb: "Behaviour and a11y without opinions on looks.", renderable: true },
  { slug: "blocks-sections", name: "Blocks & Sections", group: "ui", icon: "LayoutTemplate", blurb: "Page-sized chunks you paste in.", renderable: true },
  { slug: "forms-inputs", name: "Forms & Inputs", group: "ui", icon: "TextCursorInput", blurb: "Fields, validation, multi-step flows.", renderable: true },
  { slug: "tables-grids", name: "Tables & Data Grids", group: "ui", icon: "Table2", blurb: "Sorting, virtualisation, editable cells.", renderable: true },
  { slug: "charts-dataviz", name: "Charts & Data Viz", group: "ui", icon: "ChartSpline", blurb: "Plot things without fighting D3.", renderable: true },
  { slug: "animation-motion", name: "Animation & Motion", group: "ui", icon: "Sparkles", blurb: "Springs, transitions, scroll effects.", renderable: true },
  { slug: "3d-webgl", name: "3D & WebGL", group: "ui", icon: "Box", blurb: "Shaders, scenes, and GPU-flavoured UI.", renderable: true },
  { slug: "dashboard-kits", name: "Dashboard Kits", group: "ui", icon: "LayoutDashboard", blurb: "Admin shells with the boring parts done.", renderable: true },
  { slug: "landing-kits", name: "Landing Page Kits", group: "ui", icon: "Rocket", blurb: "Marketing pages that already convert.", renderable: true },
  { slug: "templates-starters", name: "Templates & Starters", group: "ui", icon: "FileCode2", blurb: "Whole repos to clone.", renderable: true },
  { slug: "icons", name: "Icons", group: "ui", icon: "Shapes", blurb: "Icon sets, sized and licensed properly." },
  { slug: "illustrations", name: "Illustrations", group: "ui", icon: "Brush", blurb: "Vector art you can actually ship." },
  { slug: "fonts-type", name: "Fonts & Type", group: "ui", icon: "Type", blurb: "Typefaces and typographic scales." },
  { slug: "color-palettes", name: "Color & Palettes", group: "ui", icon: "Palette", blurb: "Ramps, contrast checkers, theme generators." },
  { slug: "backgrounds-patterns", name: "Backgrounds & Patterns", group: "ui", icon: "Grid2x2", blurb: "Gradients, meshes, noise, grids.", renderable: true },
  { slug: "email-templates", name: "Email Templates", group: "ui", icon: "Mail", blurb: "HTML that survives Outlook." },
  { slug: "figma-resources", name: "Figma Resources", group: "ui", icon: "Figma", blurb: "Kits, plugins and token bridges." },
  { slug: "mockups", name: "Mockups & Devices", group: "ui", icon: "Smartphone", blurb: "Frames for showing your work off." },
  { slug: "micro-interactions", name: "Micro-interactions", group: "ui", icon: "MousePointerClick", blurb: "Cursors, hovers, the small delightful stuff.", renderable: true },

  // ---------------------------------------------------------------- AI
  { slug: "ai-design-tools", name: "AI Design Tools", group: "ai", icon: "Wand2", blurb: "Prompt to mockup, mockup to code." },
  { slug: "ai-coding-agents", name: "AI Coding Agents", group: "ai", icon: "Bot", blurb: "Agents that write and run code." },
  { slug: "mcp-servers", name: "MCP Servers", group: "ai", icon: "Plug", blurb: "Tools your agent can pick up." },
  { slug: "agent-frameworks", name: "Agent Frameworks", group: "ai", icon: "Workflow", blurb: "Orchestration, memory, tool loops." },
  { slug: "prompt-tools", name: "Prompt Tools", group: "ai", icon: "MessageSquareCode", blurb: "Versioning, testing and sharing prompts." },
  { slug: "image-generation", name: "Image Generation", group: "ai", icon: "Image", blurb: "Diffusion models and the apps around them." },
  { slug: "video-generation", name: "Video Generation", group: "ai", icon: "Clapperboard", blurb: "Text to video, editing, upscaling." },
  { slug: "audio-voice", name: "Audio & Voice", group: "ai", icon: "AudioLines", blurb: "TTS, transcription, music." },
  { slug: "llm-infrastructure", name: "LLM Infrastructure", group: "ai", icon: "Server", blurb: "Gateways, routing, caching, serving." },
  { slug: "rag-vector", name: "RAG & Vector DBs", group: "ai", icon: "Database", blurb: "Chunking, embedding, retrieval." },
  { slug: "evals-observability", name: "Evals & Observability", group: "ai", icon: "Gauge", blurb: "Know whether your model got worse." },
  { slug: "fine-tuning", name: "Fine-tuning", group: "ai", icon: "SlidersHorizontal", blurb: "Adapters, datasets, training runs." },

  // ---------------------------------------------------------------- BUILD
  { slug: "frameworks", name: "Frameworks", group: "build", icon: "Frame", blurb: "The thing your app is written in." },
  { slug: "css-styling", name: "CSS & Styling", group: "build", icon: "Paintbrush", blurb: "Utility engines, CSS-in-JS, preprocessors." },
  { slug: "state-management", name: "State Management", group: "build", icon: "Share2", blurb: "Stores, signals, machines." },
  { slug: "auth", name: "Auth", group: "build", icon: "KeyRound", blurb: "Sessions, OAuth, passkeys." },
  { slug: "databases", name: "Databases", group: "build", icon: "HardDrive", blurb: "Relational, document, edge and otherwise." },
  { slug: "backends-baas", name: "Backends & BaaS", group: "build", icon: "Cloud", blurb: "Batteries-included backends." },
  { slug: "apis", name: "APIs", group: "build", icon: "Webhook", blurb: "Public APIs worth wiring up." },
  { slug: "hosting-deploy", name: "Hosting & Deploy", group: "build", icon: "UploadCloud", blurb: "Where it runs in production." },
  { slug: "analytics", name: "Analytics", group: "build", icon: "TrendingUp", blurb: "Product, web and error analytics." },
  { slug: "payments", name: "Payments", group: "build", icon: "CreditCard", blurb: "Checkout, subscriptions, billing." },
  { slug: "email-messaging", name: "Email & Messaging", group: "build", icon: "Send", blurb: "Transactional email, SMS, push." },
  { slug: "search", name: "Search", group: "build", icon: "Search", blurb: "Full text, hybrid, typo-tolerant." },
  { slug: "cms", name: "CMS", group: "build", icon: "FileText", blurb: "Content modelling for people who aren't you." },
  { slug: "testing", name: "Testing", group: "build", icon: "FlaskConical", blurb: "Unit, e2e, visual regression." },
  { slug: "devtools", name: "DevTools", group: "build", icon: "Terminal", blurb: "CLIs, editors, local tooling." },
  { slug: "no-code", name: "No-code", group: "build", icon: "Blocks", blurb: "Build without writing it." },

  // ---------------------------------------------------------------- CRAFT
  { slug: "accessibility", name: "Accessibility", group: "craft", icon: "Accessibility", blurb: "Audits, linters, and patterns that pass." },
  { slug: "performance", name: "Performance", group: "craft", icon: "Zap", blurb: "Bundle budgets, profiling, Core Web Vitals." },
  { slug: "documentation", name: "Documentation", group: "craft", icon: "BookOpen", blurb: "Docs sites and API reference generators." },
  { slug: "design-engineering", name: "Design Engineering", group: "craft", icon: "Ruler", blurb: "The seam between Figma and main." },
  { slug: "inspiration", name: "Inspiration", group: "craft", icon: "Eye", blurb: "Portfolios, galleries, awwwards bait." },
] as const;

export const categoryBySlug: ReadonlyMap<string, Category> = new Map(
  categories.map((c) => [c.slug, c])
);

export function categoriesInGroup(group: CategoryGroupId): Category[] {
  return categories.filter((c) => c.group === group);
}

/* ==========================================================================
   FACETS — the Stack Compatibility Graph
   ========================================================================== */

export type FacetOption = { value: string; label: string; hint?: string };

export type Facet = {
  id: string;
  label: string;
  /** short label used on compact filter chips */
  short: string;
  multi: boolean;
  options: readonly FacetOption[];
};

export const facets: readonly Facet[] = [
  {
    id: "framework",
    label: "Framework",
    short: "Framework",
    multi: true,
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
    options: [
      { value: "npm", label: "npm package" },
      { value: "copy-paste", label: "Copy & paste" },
      { value: "cli", label: "CLI (shadcn-style)" },
      { value: "cdn", label: "CDN" },
    ],
  },
] as const;

export const facetById: ReadonlyMap<string, Facet> = new Map(
  facets.map((f) => [f.id, f])
);

export function facetOptionLabel(facetId: string, value: string): string {
  return (
    facetById.get(facetId)?.options.find((o) => o.value === value)?.label ??
    value
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
