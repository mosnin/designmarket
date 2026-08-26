import type { UIComponent } from "@/lib/types";
import { daysAgo } from "./helpers";
import { stableHash } from "@/lib/utils";

/**
 * The component-level index.
 *
 * `previewMode` decides how a component reaches the screen:
 *
 *  - "registry"  the render layer has a real implementation for it, backed by
 *                a package actually installed in the preview sandbox (Radix,
 *                Recharts, cmdk, Motion…) or by Vitrine's own registry. These
 *                are genuinely running code, not screenshots.
 *  - "compiled"  the listing ships source we compile in the sandbox at runtime.
 *  - "static"    we have not vendored the package yet, so the card links out
 *                and says so rather than pretending.
 *
 * Being explicit about the third case is deliberate: a marketplace that claims
 * everything renders and then shows a placeholder is worse than one that tells
 * you which is which.
 */

type SeedComponent = Omit<UIComponent, "_id" | "createdAt" | "views" | "saves"> & {
  createdAt?: number;
};

const raw: SeedComponent[] = [
  /* -------------------------------------------------- shadcn/ui */
  {
    listingSlug: "shadcn-ui", slug: "shadcn-button", name: "Button", kind: "button",
    description: "Six variants and four sizes over a single cva recipe, with asChild so it can become a link without losing its styling.",
    previewMode: "registry", registryKey: "shadcn/button",
    installCommand: "npx shadcn@latest add button",
    importLine: 'import { Button } from "@/components/ui/button"',
    props: [
      { name: "variant", type: "enum", options: ["default", "secondary", "outline", "ghost", "link", "destructive"], defaultValue: "default" },
      { name: "size", type: "enum", options: ["sm", "default", "lg", "icon"], defaultValue: "default" },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    deps: ["@radix-ui/react-slot", "class-variance-authority"],
    a11yNotes: "Native button semantics; focus ring uses :focus-visible so it never fires on mouse click.",
    tags: ["cva", "asChild", "variants"], featured: true, canvasHeight: 180,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-dialog", name: "Dialog", kind: "dialog",
    description: "Modal built on Radix Dialog — focus trap, scroll lock, Escape to close, and an overlay that stays keyboard-inert.",
    previewMode: "registry", registryKey: "shadcn/dialog",
    installCommand: "npx shadcn@latest add dialog",
    importLine: 'import { Dialog, DialogContent } from "@/components/ui/dialog"',
    props: [
      { name: "size", type: "enum", options: ["sm", "default", "lg"], defaultValue: "default" },
      { name: "showClose", type: "boolean", defaultValue: true },
    ],
    deps: ["@radix-ui/react-dialog"],
    a11yNotes: "Focus is trapped and restored to the trigger on close. aria-modal and labelled title are wired for you.",
    tags: ["modal", "radix", "focus-trap"], featured: true, canvasHeight: 260,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-command", name: "Command", kind: "command",
    description: "The ⌘K palette: fuzzy filtering, grouped results, keyboard-only navigation. cmdk under the hood.",
    previewMode: "registry", registryKey: "shadcn/command",
    installCommand: "npx shadcn@latest add command",
    importLine: 'import { Command, CommandInput } from "@/components/ui/command"',
    props: [
      { name: "placeholder", type: "string", defaultValue: "Type a command or search…" },
      { name: "showGroups", type: "boolean", defaultValue: true },
    ],
    deps: ["cmdk"],
    a11yNotes: "combobox/listbox roles with aria-activedescendant; arrow keys move selection without moving DOM focus.",
    tags: ["cmdk", "palette", "search"], featured: true, canvasHeight: 320,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-tabs", name: "Tabs", kind: "tabs",
    description: "Roving-tabindex tab list with automatic activation, built on Radix Tabs.",
    previewMode: "registry", registryKey: "shadcn/tabs",
    installCommand: "npx shadcn@latest add tabs",
    importLine: 'import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"',
    props: [
      { name: "orientation", type: "enum", options: ["horizontal", "vertical"], defaultValue: "horizontal" },
      { name: "count", type: "number", defaultValue: 3 },
    ],
    deps: ["@radix-ui/react-tabs"],
    a11yNotes: "Arrow keys move between tabs, Home/End jump to ends, panels are linked with aria-controls.",
    tags: ["radix", "roving-tabindex"], featured: false, canvasHeight: 200,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-select", name: "Select", kind: "select",
    description: "Collision-aware listbox with typeahead, scroll buttons and full keyboard support.",
    previewMode: "registry", registryKey: "shadcn/select",
    installCommand: "npx shadcn@latest add select",
    importLine: 'import { Select, SelectTrigger } from "@/components/ui/select"',
    props: [
      { name: "size", type: "enum", options: ["sm", "default"], defaultValue: "default" },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    deps: ["@radix-ui/react-select"],
    a11yNotes: "Type any letter to jump to a matching option. Selection is announced on change.",
    tags: ["radix", "listbox", "typeahead"], featured: false, canvasHeight: 200,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-toast", name: "Sonner Toast", kind: "toast",
    description: "Stacked, swipe-dismissible notifications that pause on hover and respect reduced motion.",
    previewMode: "registry", registryKey: "shadcn/toast",
    installCommand: "npx shadcn@latest add sonner",
    importLine: 'import { toast } from "sonner"',
    props: [
      { name: "variant", type: "enum", options: ["default", "success", "error", "warning"], defaultValue: "success" },
      { name: "withAction", type: "boolean", defaultValue: true },
    ],
    deps: ["sonner"],
    a11yNotes: "Rendered into an aria-live region so screen readers announce without stealing focus.",
    tags: ["sonner", "notifications"], featured: false, canvasHeight: 200,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-form", name: "Form Field", kind: "form",
    description: "React Hook Form + Zod wired to labels, descriptions and error messages with the aria plumbing already correct.",
    previewMode: "registry", registryKey: "shadcn/form",
    installCommand: "npx shadcn@latest add form",
    importLine: 'import { Form, FormField } from "@/components/ui/form"',
    props: [
      { name: "showError", type: "boolean", defaultValue: false },
      { name: "layout", type: "enum", options: ["stacked", "inline"], defaultValue: "stacked" },
    ],
    deps: ["react-hook-form", "zod", "@hookform/resolvers"],
    a11yNotes: "aria-invalid and aria-describedby are derived from validation state, so errors are announced.",
    tags: ["react-hook-form", "zod", "validation"], featured: true, canvasHeight: 280,
  },
  {
    listingSlug: "shadcn-ui", slug: "shadcn-data-table", name: "Data Table", kind: "data-grid",
    description: "TanStack Table wired to shadcn primitives: sorting, column visibility, row selection and pagination.",
    previewMode: "registry", registryKey: "shadcn/data-table",
    installCommand: "npx shadcn@latest add table",
    importLine: 'import { DataTable } from "@/components/data-table"',
    props: [
      { name: "rows", type: "number", defaultValue: 6 },
      { name: "selectable", type: "boolean", defaultValue: true },
      { name: "density", type: "enum", options: ["comfortable", "compact"], defaultValue: "comfortable" },
    ],
    deps: ["@tanstack/react-table"],
    a11yNotes: "Real table semantics with scope on headers; sort state exposed via aria-sort.",
    tags: ["tanstack", "sorting", "selection"], featured: true, canvasHeight: 380,
  },

  /* -------------------------------------------------- Radix */
  {
    listingSlug: "radix-primitives", slug: "radix-tooltip", name: "Tooltip", kind: "tooltip",
    description: "Hover and focus triggered, collision aware, with a shared delay so a row of them doesn't flicker.",
    previewMode: "registry", registryKey: "radix/tooltip",
    installCommand: "npm i @radix-ui/react-tooltip",
    importLine: 'import * as Tooltip from "@radix-ui/react-tooltip"',
    props: [
      { name: "side", type: "enum", options: ["top", "right", "bottom", "left"], defaultValue: "top" },
      { name: "delayDuration", type: "number", defaultValue: 200 },
    ],
    deps: ["@radix-ui/react-tooltip"],
    a11yNotes: "Opens on keyboard focus as well as hover, and never traps a pointer-only user.",
    tags: ["overlay", "positioning"], featured: false, canvasHeight: 180,
  },
  {
    listingSlug: "radix-primitives", slug: "radix-accordion", name: "Accordion", kind: "accordion",
    description: "Single or multiple expansion with CSS-variable height animation that works without measuring in JS.",
    previewMode: "registry", registryKey: "radix/accordion",
    installCommand: "npm i @radix-ui/react-accordion",
    importLine: 'import * as Accordion from "@radix-ui/react-accordion"',
    props: [
      { name: "type", type: "enum", options: ["single", "multiple"], defaultValue: "single" },
      { name: "collapsible", type: "boolean", defaultValue: true },
    ],
    deps: ["@radix-ui/react-accordion"],
    a11yNotes: "Headers are real buttons inside heading elements; aria-expanded and aria-controls are managed.",
    tags: ["disclosure", "radix"], featured: false, canvasHeight: 280,
  },
  {
    listingSlug: "radix-primitives", slug: "radix-dropdown", name: "Dropdown Menu", kind: "dropdown",
    description: "Nested submenus, checkbox and radio items, typeahead, and pointer-intent handling that forgives diagonal mouse paths.",
    previewMode: "registry", registryKey: "radix/dropdown",
    installCommand: "npm i @radix-ui/react-dropdown-menu",
    importLine: 'import * as DropdownMenu from "@radix-ui/react-dropdown-menu"',
    props: [
      { name: "align", type: "enum", options: ["start", "center", "end"], defaultValue: "start" },
      { name: "withCheckboxes", type: "boolean", defaultValue: true },
    ],
    deps: ["@radix-ui/react-dropdown-menu"],
    a11yNotes: "menu/menuitem roles, arrow-key navigation, Escape closes and returns focus to the trigger.",
    tags: ["menu", "radix", "submenu"], featured: false, canvasHeight: 240,
  },
  {
    listingSlug: "radix-primitives", slug: "radix-slider", name: "Slider", kind: "slider",
    description: "Single or range thumbs, step and min-steps-between-thumbs, RTL aware.",
    previewMode: "registry", registryKey: "radix/slider",
    installCommand: "npm i @radix-ui/react-slider",
    importLine: 'import * as Slider from "@radix-ui/react-slider"',
    props: [
      { name: "range", type: "boolean", defaultValue: false },
      { name: "step", type: "number", defaultValue: 1 },
    ],
    deps: ["@radix-ui/react-slider"],
    a11yNotes: "Arrow keys step, Page keys jump, Home/End go to bounds; value announced via aria-valuenow.",
    tags: ["input", "range"], featured: false, canvasHeight: 160,
  },
  {
    listingSlug: "radix-primitives", slug: "radix-switch", name: "Switch", kind: "switch",
    description: "A two-state toggle with correct role and a thumb transition that respects prefers-reduced-motion.",
    previewMode: "registry", registryKey: "radix/switch",
    installCommand: "npm i @radix-ui/react-switch",
    importLine: 'import * as Switch from "@radix-ui/react-switch"',
    props: [
      { name: "checked", type: "boolean", defaultValue: true },
      { name: "disabled", type: "boolean", defaultValue: false },
    ],
    deps: ["@radix-ui/react-switch"],
    a11yNotes: "role=switch with aria-checked — announced as on/off rather than as a checkbox.",
    tags: ["toggle", "form"], featured: false, canvasHeight: 140,
  },

  /* -------------------------------------------------- Recharts / Tremor */
  {
    listingSlug: "recharts", slug: "recharts-area", name: "Area Chart", kind: "chart",
    description: "Gradient-filled area chart with a responsive container, custom tooltip and theme-aware stroke.",
    previewMode: "registry", registryKey: "recharts/area",
    installCommand: "npm i recharts",
    importLine: 'import { AreaChart, Area } from "recharts"',
    props: [
      { name: "curve", type: "enum", options: ["monotone", "linear", "step"], defaultValue: "monotone" },
      { name: "showGrid", type: "boolean", defaultValue: true },
      { name: "stacked", type: "boolean", defaultValue: false },
    ],
    deps: ["recharts"],
    a11yNotes: "SVG chart — pair with a visually hidden data table for screen reader users.",
    tags: ["chart", "svg", "responsive"], featured: true, canvasHeight: 300, gridBackdrop: true,
  },
  {
    listingSlug: "recharts", slug: "recharts-bar", name: "Bar Chart", kind: "chart",
    description: "Grouped or stacked bars with rounded caps and a legend that toggles series.",
    previewMode: "registry", registryKey: "recharts/bar",
    installCommand: "npm i recharts",
    importLine: 'import { BarChart, Bar } from "recharts"',
    props: [
      { name: "stacked", type: "boolean", defaultValue: false },
      { name: "horizontal", type: "boolean", defaultValue: false },
    ],
    deps: ["recharts"],
    tags: ["chart", "bars"], featured: false, canvasHeight: 300, gridBackdrop: true,
  },
  {
    listingSlug: "tremor", slug: "tremor-kpi-card", name: "KPI Card", kind: "stat",
    description: "Metric, delta badge and inline sparkline in the density analytics dashboards actually need.",
    previewMode: "registry", registryKey: "tremor/kpi",
    installCommand: "npm i @tremor/react",
    importLine: 'import { Card, Metric } from "@tremor/react"',
    props: [
      { name: "trend", type: "enum", options: ["up", "down", "flat"], defaultValue: "up" },
      { name: "showSparkline", type: "boolean", defaultValue: true },
    ],
    deps: ["recharts"],
    tags: ["dashboard", "metric", "sparkline"], featured: true, canvasHeight: 200,
  },
  {
    listingSlug: "tremor", slug: "tremor-sparkline", name: "Sparkline", kind: "sparkline",
    description: "Axis-free trend line sized to sit inline in a table cell or a stat card.",
    previewMode: "registry", registryKey: "tremor/sparkline",
    installCommand: "npm i @tremor/react",
    importLine: 'import { SparkAreaChart } from "@tremor/react"',
    props: [
      { name: "variant", type: "enum", options: ["area", "line", "bars"], defaultValue: "area" },
      { name: "points", type: "number", defaultValue: 24 },
    ],
    deps: ["recharts"],
    tags: ["inline", "trend"], featured: false, canvasHeight: 140,
  },

  /* -------------------------------------------------- Motion / effects */
  {
    listingSlug: "motion", slug: "motion-layout-list", name: "Layout Animated List", kind: "list",
    description: "Reorderable list where every item animates to its new position via the layout prop — no FLIP maths by hand.",
    previewMode: "registry", registryKey: "motion/layout-list",
    installCommand: "npm i motion",
    importLine: 'import { motion, AnimatePresence } from "motion/react"',
    props: [
      { name: "items", type: "number", defaultValue: 5 },
      { name: "spring", type: "enum", options: ["gentle", "snappy", "bouncy"], defaultValue: "snappy" },
    ],
    deps: ["motion"],
    a11yNotes: "Animation is suppressed entirely under prefers-reduced-motion rather than merely shortened.",
    tags: ["layout", "flip", "reorder"], featured: true, canvasHeight: 320,
  },
  {
    listingSlug: "motion", slug: "motion-shared-element", name: "Shared Element Transition", kind: "carousel",
    description: "A card that expands into a detail view with layoutId, keeping the same DOM node throughout.",
    previewMode: "registry", registryKey: "motion/shared-element",
    installCommand: "npm i motion",
    importLine: 'import { motion } from "motion/react"',
    props: [{ name: "duration", type: "number", defaultValue: 0.4 }],
    deps: ["motion"],
    tags: ["layoutId", "transition"], featured: false, canvasHeight: 340,
  },
  {
    listingSlug: "magic-ui", slug: "magic-marquee", name: "Marquee", kind: "marquee",
    description: "Infinite CSS-driven scroller with edge fades and pause-on-hover. No JS ticking per frame.",
    previewMode: "registry", registryKey: "magic/marquee",
    installCommand: "npx shadcn@latest add \"https://magicui.design/r/marquee\"",
    importLine: 'import { Marquee } from "@/components/ui/marquee"',
    props: [
      { name: "direction", type: "enum", options: ["left", "right"], defaultValue: "left" },
      { name: "speed", type: "enum", options: ["slow", "normal", "fast"], defaultValue: "normal" },
      { name: "pauseOnHover", type: "boolean", defaultValue: true },
    ],
    deps: [],
    a11yNotes: "Motion stops under prefers-reduced-motion; content stays in the accessibility tree either way.",
    tags: ["logos", "css-animation", "infinite"], featured: true, canvasHeight: 180,
  },
  {
    listingSlug: "magic-ui", slug: "magic-number-ticker", name: "Number Ticker", kind: "stat",
    description: "Counts a number up when it scrolls into view, with locale-aware formatting.",
    previewMode: "registry", registryKey: "magic/number-ticker",
    installCommand: "npx shadcn@latest add \"https://magicui.design/r/number-ticker\"",
    importLine: 'import { NumberTicker } from "@/components/ui/number-ticker"',
    props: [
      { name: "value", type: "number", defaultValue: 12480 },
      { name: "decimals", type: "number", defaultValue: 0 },
    ],
    deps: ["motion"],
    a11yNotes: "The final value is rendered for assistive tech immediately; only the visual count animates.",
    tags: ["counter", "scroll", "stats"], featured: false, canvasHeight: 160,
  },
  {
    listingSlug: "magic-ui", slug: "magic-animated-grid", name: "Animated Grid Pattern", kind: "background",
    description: "A grid backdrop where cells light up on a randomised schedule. Pure CSS and SVG.",
    previewMode: "registry", registryKey: "magic/grid-pattern",
    installCommand: "npx shadcn@latest add \"https://magicui.design/r/animated-grid-pattern\"",
    importLine: 'import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern"',
    props: [
      { name: "density", type: "enum", options: ["sparse", "normal", "dense"], defaultValue: "normal" },
      { name: "animate", type: "boolean", defaultValue: true },
    ],
    deps: ["motion"],
    tags: ["background", "svg", "decorative"], featured: false, canvasHeight: 260,
  },
  {
    listingSlug: "motion-primitives", slug: "mp-text-shimmer", name: "Text Shimmer", kind: "text-effect",
    description: "A moving highlight across text, used for streaming or loading states. background-clip, not an overlay.",
    previewMode: "registry", registryKey: "mp/text-shimmer",
    installCommand: "npx motion-primitives@latest add text-shimmer",
    importLine: 'import { TextShimmer } from "@/components/ui/text-shimmer"',
    props: [
      { name: "duration", type: "number", defaultValue: 2 },
      { name: "size", type: "enum", options: ["sm", "base", "lg", "xl"], defaultValue: "lg" },
    ],
    deps: ["motion"],
    tags: ["loading", "streaming", "text"], featured: true, canvasHeight: 140,
  },
  {
    listingSlug: "motion-primitives", slug: "mp-animated-cursor", name: "Animated Cursor", kind: "cursor",
    description: "A follower cursor that morphs over interactive targets, with a spring that settles rather than snaps.",
    previewMode: "registry", registryKey: "mp/cursor",
    installCommand: "npx motion-primitives@latest add cursor",
    importLine: 'import { Cursor } from "@/components/ui/cursor"',
    props: [{ name: "variant", type: "enum", options: ["dot", "ring", "label"], defaultValue: "ring" }],
    deps: ["motion"],
    a11yNotes: "Decorative only — hidden from assistive tech and disabled on touch input.",
    tags: ["pointer", "micro-interaction"], featured: false, canvasHeight: 240,
  },

  /* -------------------------------------------------- Vitrine's own registry */
  {
    listingSlug: "vitrine-registry", slug: "vt-empty-state", name: "Empty State", kind: "empty-state",
    description: "The screen nobody designs until launch week: icon, one honest sentence, and exactly one next action.",
    previewMode: "registry", registryKey: "vitrine/empty-state",
    installCommand: "npx vitrine@latest add empty-state",
    importLine: 'import { EmptyState } from "@/components/ui/empty-state"',
    props: [
      { name: "tone", type: "enum", options: ["neutral", "search", "error"], defaultValue: "neutral" },
      { name: "withAction", type: "boolean", defaultValue: true },
    ],
    deps: ["lucide-react"],
    a11yNotes: "The illustration is aria-hidden; the message is a real heading so it lands in the document outline.",
    tags: ["states", "onboarding"], featured: true, canvasHeight: 260,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-stat-tile", name: "Stat Tile", kind: "stat",
    description: "Label, value, delta and an optional footnote at four densities, sized to tile without ragged baselines.",
    previewMode: "registry", registryKey: "vitrine/stat-tile",
    installCommand: "npx vitrine@latest add stat-tile",
    importLine: 'import { StatTile } from "@/components/ui/stat-tile"',
    props: [
      { name: "density", type: "enum", options: ["compact", "comfortable"], defaultValue: "comfortable" },
      { name: "trend", type: "enum", options: ["up", "down", "flat"], defaultValue: "up" },
      { name: "withFootnote", type: "boolean", defaultValue: true },
    ],
    deps: [],
    tags: ["dashboard", "metric"], featured: false, canvasHeight: 200,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-code-block", name: "Code Block", kind: "code-block",
    description: "Copy button, filename tab, line highlighting and a scroll region that never pushes the page sideways.",
    previewMode: "registry", registryKey: "vitrine/code-block",
    installCommand: "npx vitrine@latest add code-block",
    importLine: 'import { CodeBlock } from "@/components/ui/code-block"',
    props: [
      { name: "showLineNumbers", type: "boolean", defaultValue: true },
      { name: "wrap", type: "boolean", defaultValue: false },
    ],
    deps: [],
    a11yNotes: "The copy button announces success via aria-live rather than only changing its icon.",
    tags: ["docs", "copy", "syntax"], featured: true, canvasHeight: 280,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-prompt-input", name: "Prompt Input", kind: "prompt-input",
    description: "Auto-growing composer with model picker, attachment slot, token counter and Cmd+Enter to send.",
    previewMode: "registry", registryKey: "vitrine/prompt-input",
    installCommand: "npx vitrine@latest add prompt-input",
    importLine: 'import { PromptInput } from "@/components/ui/prompt-input"',
    props: [
      { name: "showModelPicker", type: "boolean", defaultValue: true },
      { name: "showTokenCount", type: "boolean", defaultValue: true },
      { name: "state", type: "enum", options: ["idle", "streaming"], defaultValue: "idle" },
    ],
    deps: ["lucide-react"],
    a11yNotes: "Textarea keeps its label; the send shortcut is announced in the description, not hidden in a tooltip.",
    tags: ["ai", "chat", "composer"], featured: true, canvasHeight: 240,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-diff-view", name: "Diff View", kind: "diff",
    description: "Unified or split diff with word-level highlighting and collapsible unchanged runs.",
    previewMode: "registry", registryKey: "vitrine/diff",
    installCommand: "npx vitrine@latest add diff-view",
    importLine: 'import { DiffView } from "@/components/ui/diff-view"',
    props: [
      { name: "mode", type: "enum", options: ["unified", "split"], defaultValue: "unified" },
      { name: "collapseContext", type: "boolean", defaultValue: true },
    ],
    deps: [],
    a11yNotes: "Additions and removals carry text labels, not colour alone.",
    tags: ["code", "review", "git"], featured: false, canvasHeight: 320,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-model-badge", name: "Model Badge", kind: "badge",
    description: "Provider mark, model name, context window and a live/deprecated dot — the chip every AI product ends up needing.",
    previewMode: "registry", registryKey: "vitrine/model-badge",
    installCommand: "npx vitrine@latest add model-badge",
    importLine: 'import { ModelBadge } from "@/components/ui/model-badge"',
    props: [
      { name: "state", type: "enum", options: ["live", "preview", "deprecated"], defaultValue: "live" },
      { name: "showContext", type: "boolean", defaultValue: true },
    ],
    deps: [],
    tags: ["ai", "chip"], featured: false, canvasHeight: 140,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-token-swatches", name: "Token Swatches", kind: "gallery",
    description: "Renders a design-token set as labelled swatches with contrast ratios computed against their pair.",
    previewMode: "registry", registryKey: "vitrine/token-swatches",
    installCommand: "npx vitrine@latest add token-swatches",
    importLine: 'import { TokenSwatches } from "@/components/ui/token-swatches"',
    props: [
      { name: "showContrast", type: "boolean", defaultValue: true },
      { name: "columns", type: "number", defaultValue: 4 },
    ],
    deps: [],
    a11yNotes: "Contrast ratios are printed as text so the check does not itself depend on seeing colour.",
    tags: ["design-tokens", "color", "contrast"], featured: true, canvasHeight: 280,
  },
  {
    listingSlug: "vitrine-registry", slug: "vt-skeleton-set", name: "Skeleton Set", kind: "skeleton",
    description: "Loading placeholders shaped like the content that replaces them, so nothing jumps on hydration.",
    previewMode: "registry", registryKey: "vitrine/skeleton",
    installCommand: "npx vitrine@latest add skeleton-set",
    importLine: 'import { SkeletonCard } from "@/components/ui/skeleton-set"',
    props: [
      { name: "shape", type: "enum", options: ["card", "row", "article"], defaultValue: "card" },
      { name: "shimmer", type: "boolean", defaultValue: true },
    ],
    deps: [],
    a11yNotes: "Marked aria-busy on the container rather than announcing each placeholder.",
    tags: ["loading", "cls"], featured: false, canvasHeight: 240,
  },

  /* -------------------------------------------------- cmdk / sonner / forms */
  {
    listingSlug: "shadcn-ui", slug: "shadcn-combobox", name: "Combobox", kind: "combobox",
    description: "Popover plus command list: filterable, keyboard-first, and it clears properly on Escape.",
    previewMode: "registry", registryKey: "shadcn/combobox",
    installCommand: "npx shadcn@latest add combobox",
    importLine: 'import { Combobox } from "@/components/ui/combobox"',
    props: [
      { name: "multiple", type: "boolean", defaultValue: false },
      { name: "placeholder", type: "string", defaultValue: "Select framework…" },
    ],
    deps: ["cmdk", "@radix-ui/react-popover"],
    a11yNotes: "aria-expanded on the trigger and aria-selected on options; focus stays in the input while arrowing.",
    tags: ["autocomplete", "cmdk"], featured: false, canvasHeight: 300,
  },
  {
    listingSlug: "react-hook-form", slug: "rhf-otp-field", name: "OTP Field", kind: "otp",
    description: "Six single-character inputs that behave as one field: paste fills them all, backspace walks back.",
    previewMode: "registry", registryKey: "vitrine/otp",
    installCommand: "npx shadcn@latest add input-otp",
    importLine: 'import { InputOTP } from "@/components/ui/input-otp"',
    props: [
      { name: "length", type: "number", defaultValue: 6 },
      { name: "state", type: "enum", options: ["idle", "error", "success"], defaultValue: "idle" },
    ],
    deps: ["input-otp"],
    a11yNotes: "Presented as a single labelled group with one-time-code autocomplete so password managers cooperate.",
    tags: ["auth", "input", "paste"], featured: false, canvasHeight: 180,
  },

  /* -------------------------------------------------- Static (not vendored yet) */
  {
    listingSlug: "mantine", slug: "mantine-date-picker", name: "Date Picker", kind: "date-picker",
    description: "Range selection, presets, min/max bounds and locale support out of the box.",
    previewMode: "static",
    installCommand: "npm i @mantine/dates",
    importLine: 'import { DatePicker } from "@mantine/dates"',
    props: [], deps: ["@mantine/dates", "dayjs"],
    tags: ["dates", "range"], featured: false,
  },
  {
    listingSlug: "mantine", slug: "mantine-rich-text", name: "Rich Text Editor", kind: "editor",
    description: "Tiptap wrapped with a working toolbar, bubble menu and paste handling.",
    previewMode: "static",
    installCommand: "npm i @mantine/tiptap",
    importLine: 'import { RichTextEditor } from "@mantine/tiptap"',
    props: [], deps: ["@mantine/tiptap", "@tiptap/react"],
    tags: ["tiptap", "wysiwyg"], featured: false,
  },
  {
    listingSlug: "ag-grid", slug: "ag-grid-virtual", name: "Virtualised Grid", kind: "data-grid",
    description: "Row and column virtualisation that stays smooth past a million rows.",
    previewMode: "static",
    installCommand: "npm i ag-grid-react ag-grid-community",
    importLine: 'import { AgGridReact } from "ag-grid-react"',
    props: [], deps: ["ag-grid-community"],
    tags: ["virtualisation", "enterprise"], featured: false,
  },
  {
    listingSlug: "heroui", slug: "heroui-autocomplete", name: "Autocomplete", kind: "combobox",
    description: "Async loading, sections and virtualisation, over React Aria's combobox behaviour.",
    previewMode: "static",
    installCommand: "npm i @heroui/autocomplete",
    importLine: 'import { Autocomplete } from "@heroui/react"',
    props: [], deps: ["@heroui/react"],
    tags: ["react-aria", "async"], featured: false,
  },
  {
    listingSlug: "chakra-ui", slug: "chakra-toast", name: "Toaster", kind: "toast",
    description: "Placement-aware toasts with promise helpers and pause-on-interaction.",
    previewMode: "static",
    installCommand: "npm i @chakra-ui/react",
    importLine: 'import { toaster } from "@/components/ui/toaster"',
    props: [], deps: ["@chakra-ui/react"],
    tags: ["notifications"], featured: false,
  },
  {
    listingSlug: "wcag-patterns", slug: "apg-combobox-pattern", name: "Combobox Pattern", kind: "combobox",
    description: "The reference keyboard map and ARIA wiring every combobox implementation is measured against.",
    previewMode: "static",
    props: [], deps: [],
    a11yNotes: "Defines the expected behaviour for Escape, Alt+Down, Home/End and aria-activedescendant.",
    tags: ["reference", "wai-aria", "keyboard"], featured: false,
  },
];

export const seedComponents: UIComponent[] = raw.map((c) => {
  const h = stableHash(c.slug);
  const h2 = stableHash(`${c.slug}:s`);
  return {
    ...c,
    _id: `component:${c.slug}`,
    createdAt: c.createdAt ?? daysAgo(10 + Math.floor(h * 400)),
    views: Math.round(120 + h * 5_400 + (c.featured ? 2_600 : 0)),
    saves: Math.round(6 + h2 * 480 + (c.featured ? 180 : 0)),
  };
});
