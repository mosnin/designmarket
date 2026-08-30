import type { Listing } from "@/lib/types";
import { hydrate, stack, type SeedListing } from "./helpers";

/**
 * MCP servers, agent skills, public APIs and open-source repositories.
 *
 * Same rule as everything else in the catalogue: the descriptions are authored
 * and verifiable, the numbers are fetched. Anything without a published npm
 * package simply carries no figures until `convex/ingest.ts` collects GitHub
 * data on a live deployment.
 */

const hosted = stack({
  frameworks: ["vanilla"],
  styling: ["unstyled"],
  react: "any",
  rsc: "safe",
  a11y: "unknown",
  install: ["cdn"],
});

const cli = stack({
  frameworks: ["vanilla"],
  styling: ["unstyled"],
  react: "any",
  rsc: "safe",
  a11y: "unknown",
  install: ["cli", "npm"],
});

const raw: SeedListing[] = [
  /* ======================================================================
     MCP SERVERS
     ====================================================================== */
  {
    kind: "mcp", slug: "mcp-github", name: "GitHub MCP Server",
    tagline: "Repos, issues, PRs and code search as agent tools",
    description:
      "GitHub's own MCP server. Lets an agent read and write issues, pull requests, files and workflow runs with the caller's own permissions, which is the part that matters — the agent inherits your access rather than a shared token's.",
    categories: ["mcp-dev"], tags: ["github", "issues", "pull-requests", "oauth"],
    homepage: "https://github.com/github/github-mcp-server",
    repo: "https://github.com/github/github-mcp-server",
    docs: "https://docs.github.com/copilot/using-github-copilot/coding-agent/mcp",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: cli,
    details: {
      transport: "both", auth: "OAuth or personal access token",
      tools: ["search_code", "create_issue", "get_pull_request", "list_commits", "create_branch"],
    },
    color: "#0b0b0f", monogram: "GH", featured: true, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-playwright", name: "Playwright MCP",
    tagline: "Drive a real browser from an agent, via the accessibility tree",
    description:
      "Microsoft's browser automation server. Notably it drives pages through the accessibility tree rather than screenshots, so the agent works from structured state instead of guessing at pixels — faster, cheaper and far more reliable.",
    categories: ["mcp-browser", "mcp-dev"], tags: ["playwright", "browser", "automation", "a11y-tree"],
    homepage: "https://github.com/microsoft/playwright-mcp",
    repo: "https://github.com/microsoft/playwright-mcp",
    npm: "@playwright/mcp",
    license: "Apache-2.0", licenseBucket: "apache-2.0", pricing: "open-source",
    stack: cli,
    details: {
      transport: "stdio", auth: "None — runs locally",
      tools: ["browser_navigate", "browser_click", "browser_snapshot", "browser_type", "browser_evaluate"],
    },
    color: "#2ead33", monogram: "PW", featured: true, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-context7", name: "Context7",
    tagline: "Version-correct library docs, injected on demand",
    description:
      "Pulls the documentation for the exact version of a library you are using into the agent's context. Aimed squarely at the failure mode where a model confidently writes an API that was removed two majors ago.",
    categories: ["mcp-memory", "mcp-dev"], tags: ["docs", "context", "versions", "upstash"],
    homepage: "https://context7.com",
    repo: "https://github.com/upstash/context7",
    npm: "@upstash/context7-mcp",
    license: "MIT", licenseBucket: "mit", pricing: "freemium",
    priceNote: "Free tier; higher limits on paid plans",
    stack: cli,
    details: {
      transport: "both", auth: "API key for hosted use",
      tools: ["resolve-library-id", "get-library-docs"],
    },
    color: "#00e9a3", monogram: "C7", featured: true, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-filesystem", name: "Filesystem MCP",
    tagline: "Scoped file access with directories you allow-list",
    description:
      "The reference filesystem server. Read, write, move and search within directories you explicitly allow — the allow-list is the whole design, and it is what makes handing an agent disk access defensible.",
    categories: ["mcp-dev", "mcp-data"], tags: ["files", "reference", "sandbox"],
    repo: "https://github.com/modelcontextprotocol/servers",
    npm: "@modelcontextprotocol/server-filesystem",
    docs: "https://modelcontextprotocol.io/docs",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: {
      transport: "stdio", auth: "None — allow-listed directories",
      tools: ["read_file", "write_file", "list_directory", "search_files", "move_file"],
    },
    color: "#d97757", monogram: "FS", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-memory", name: "Memory MCP",
    tagline: "A knowledge graph the agent keeps between sessions",
    description:
      "Entities, relations and observations stored as a graph, so an agent can remember what it learned about your codebase last week instead of rediscovering it every session.",
    categories: ["mcp-memory"], tags: ["memory", "knowledge-graph", "persistence"],
    repo: "https://github.com/modelcontextprotocol/servers",
    npm: "@modelcontextprotocol/server-memory",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: {
      transport: "stdio", auth: "None — local storage",
      tools: ["create_entities", "create_relations", "search_nodes", "read_graph"],
    },
    color: "#7c3aed", monogram: "MM", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-figma", name: "Figma Context MCP",
    tagline: "Turn a Figma frame into layout data an agent can build from",
    description:
      "Feeds an agent the structured layout, tokens and hierarchy of a Figma node rather than an image of it. The difference in generated code quality between 'here is a PNG' and 'here is the auto-layout tree' is not subtle.",
    categories: ["mcp-design"], tags: ["figma", "design-tokens", "layout", "design-to-code"],
    homepage: "https://www.framelink.ai",
    repo: "https://github.com/GLips/Figma-Context-MCP",
    npm: "figma-developer-mcp",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: {
      transport: "both", auth: "Figma personal access token",
      tools: ["get_figma_data", "download_figma_images"],
    },
    color: "#f24e1e", monogram: "FG", featured: true, verified: false, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-postgres", name: "Postgres MCP",
    tagline: "Read-only SQL against your database, schema included",
    description:
      "Exposes schema introspection and read-only queries. Read-only by default is the right call: an agent that can explain your data model is useful, and one that can drop a table is a liability.",
    categories: ["mcp-data"], tags: ["postgres", "sql", "read-only", "schema"],
    repo: "https://github.com/modelcontextprotocol/servers",
    npm: "@modelcontextprotocol/server-postgres",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: {
      transport: "stdio", auth: "Connection string",
      tools: ["query", "list_schemas", "describe_table"],
    },
    color: "#336791", monogram: "PG", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-sentry", name: "Sentry MCP",
    tagline: "Pull the actual stack trace into the fix",
    description:
      "Issues, events and stack traces as tools, so an agent debugging a production error reads the real trace rather than the summary a human pasted into chat.",
    categories: ["mcp-cloud", "mcp-dev"], tags: ["sentry", "errors", "traces", "observability"],
    homepage: "https://docs.sentry.io/product/sentry-mcp",
    repo: "https://github.com/getsentry/sentry-mcp",
    license: "Apache-2.0", licenseBucket: "apache-2.0", pricing: "free",
    stack: hosted,
    details: {
      transport: "http", auth: "OAuth",
      tools: ["find_errors", "get_issue_details", "search_events"],
    },
    color: "#362d59", monogram: "SN", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-stripe", name: "Stripe MCP",
    tagline: "Products, prices, customers and payment links as tools",
    description:
      "Stripe's own server, with a documentation search tool alongside the API tools. Useful precisely because billing is the area where a model's training data is most likely to be a version behind.",
    categories: ["mcp-payments"], tags: ["stripe", "billing", "payments", "docs"],
    homepage: "https://docs.stripe.com/mcp",
    npm: "@stripe/mcp",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: cli,
    details: {
      transport: "both", auth: "Restricted API key",
      tools: ["create_product", "create_price", "list_customers", "search_documentation"],
    },
    color: "#635bff", monogram: "ST", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-chrome-devtools", name: "Chrome DevTools MCP",
    tagline: "Performance traces and console access from an agent",
    description:
      "Google's server for driving Chrome's debugging protocol — performance traces, network requests, console output and DOM inspection. The one to reach for when the question is 'why is this slow' rather than 'does it work'.",
    categories: ["mcp-browser", "mcp-dev"], tags: ["chrome", "performance", "devtools", "tracing"],
    repo: "https://github.com/ChromeDevTools/chrome-devtools-mcp",
    npm: "chrome-devtools-mcp",
    license: "Apache-2.0", licenseBucket: "apache-2.0", pricing: "open-source",
    stack: cli,
    details: {
      transport: "stdio", auth: "None — runs locally",
      tools: ["performance_start_trace", "list_network_requests", "take_snapshot", "evaluate_script"],
    },
    color: "#4285f4", monogram: "CD", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-notion", name: "Notion MCP",
    tagline: "Read and write the docs your team actually keeps",
    description:
      "Pages, databases and comments as tools. The value is less in writing to Notion than in reading from it — most of the context an agent needs about a project is already written down there.",
    categories: ["mcp-productivity"], tags: ["notion", "docs", "databases", "wiki"],
    homepage: "https://developers.notion.com/docs/mcp",
    npm: "@notionhq/notion-mcp-server",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: cli,
    details: {
      transport: "both", auth: "OAuth or integration token",
      tools: ["search", "fetch", "create-pages", "update-page"],
    },
    color: "#0b0b0f", monogram: "NO", featured: false, verified: true, status: "live",
  },
  {
    kind: "mcp", slug: "mcp-fetch", name: "Fetch MCP",
    tagline: "Fetch a URL and hand back markdown, not soup",
    description:
      "Retrieves a page and converts it to markdown before the model sees it. Small, unglamorous, and the single most-installed server for a reason — most agent tasks start with reading something on the web.",
    categories: ["mcp-search"], tags: ["http", "markdown", "scraping", "reference"],
    repo: "https://github.com/modelcontextprotocol/servers",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: { transport: "stdio", auth: "None", tools: ["fetch"] },
    color: "#d97757", monogram: "FE", featured: false, verified: true, status: "live",
  },

  /* ======================================================================
     SKILLS
     ====================================================================== */
  {
    kind: "skill", slug: "skill-docx", name: "Word Documents",
    tagline: "Create, read and edit .docx properly — tracked changes included",
    description:
      "Handles real Word documents rather than markdown pretending to be one: headings, tables of contents, page numbers, letterheads, tracked changes and comments. The skill that turns 'write me a report' into a file someone can open in Word without reformatting it.",
    categories: ["skills-documents"], tags: ["docx", "word", "reports", "tracked-changes"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "Any task where a .docx is the input or the deliverable",
      runsIn: ["Claude Code", "Claude apps", "Agent SDK"],
    },
    color: "#2b579a", monogram: "DX", featured: true, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-xlsx", name: "Spreadsheets",
    tagline: "Formulas, formatting and charts in real .xlsx files",
    description:
      "Opens, repairs and creates spreadsheets — computing formulas rather than hard-coding results, which is the difference between a file someone can keep working in and a screenshot of numbers.",
    categories: ["skills-documents", "skills-data"], tags: ["xlsx", "excel", "formulas", "csv"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "A spreadsheet is the primary input or output",
      runsIn: ["Claude Code", "Claude apps", "Agent SDK"],
    },
    color: "#217346", monogram: "XL", featured: false, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-pptx", name: "Presentations",
    tagline: "Decks, templates, layouts and speaker notes",
    description:
      "Builds and edits .pptx — including reading an existing template's layouts and filling them, rather than generating slides that ignore the brand deck entirely.",
    categories: ["skills-documents", "skills-design"], tags: ["pptx", "slides", "decks", "templates"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "A slide deck is involved, as input or output",
      runsIn: ["Claude Code", "Claude apps", "Agent SDK"],
    },
    color: "#d24726", monogram: "PP", featured: false, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-pdf", name: "PDF",
    tagline: "Extract, merge, split, fill forms and OCR scans",
    description:
      "Everything awkward about PDFs in one place: pulling tables out of them, filling forms, splitting and merging, and OCR-ing scans so they become searchable.",
    categories: ["skills-documents"], tags: ["pdf", "ocr", "forms", "extraction"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "A .pdf needs reading, producing or manipulating",
      runsIn: ["Claude Code", "Claude apps", "Agent SDK"],
    },
    color: "#b30b00", monogram: "PD", featured: false, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-code-review", name: "Code Review",
    tagline: "Review a diff for real defects, then verify them adversarially",
    description:
      "Reviews the current diff for correctness bugs and cleanups at a chosen effort level, and — the part that matters — tries to refute its own findings before reporting them, so you get fewer, truer comments instead of a wall of plausible ones.",
    categories: ["skills-coding"], tags: ["review", "diff", "verification", "ci"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "Reviewing a PR, a branch or the working diff",
      runsIn: ["Claude Code"],
    },
    color: "#d97757", monogram: "CR", featured: true, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-security-review", name: "Security Review",
    tagline: "Audit pending changes for security defects before they merge",
    description:
      "Walks the branch's changes looking for injection, authorisation gaps, secret handling and unsafe deserialisation — scoped to what changed, which is why it finishes in a reviewable amount of time.",
    categories: ["skills-coding", "skills-ops"], tags: ["security", "audit", "review", "secrets"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "Before merging anything that touches auth, input handling or secrets",
      runsIn: ["Claude Code"],
    },
    color: "#0f8a4d", monogram: "SR", featured: false, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-dataviz", name: "Data Visualisation",
    tagline: "Charts that read as one system, in light and dark",
    description:
      "A method rather than a chart library: a form heuristic for picking the mark, a colour formula with a runnable contrast validator, and interaction rules — so a dashboard's twelve charts look like they were designed together.",
    categories: ["skills-data", "skills-design"], tags: ["charts", "palette", "accessibility", "dashboards"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "Any chart, dashboard or stat tile, in any output medium",
      runsIn: ["Claude Code", "Claude apps"],
    },
    color: "#3b82f6", monogram: "DV", featured: true, verified: true, status: "live",
  },
  {
    kind: "skill", slug: "skill-creator", name: "Skill Creator",
    tagline: "Write, test and tune skills — including their trigger wording",
    description:
      "The meta one. Scaffolds a skill, runs evals against it, and benchmarks how reliably its description triggers, which is the part everyone gets wrong: a perfect skill that never fires is worth nothing.",
    categories: ["skills-ops"], tags: ["authoring", "evals", "triggering", "meta"],
    repo: "https://github.com/anthropics/skills",
    license: "MIT", licenseBucket: "mit", pricing: "free",
    stack: hosted,
    details: {
      trigger: "Creating, editing or measuring a skill",
      runsIn: ["Claude Code"],
    },
    color: "#8b75ff", monogram: "SC", featured: false, verified: true, status: "live",
  },

  /* ======================================================================
     APIS
     ====================================================================== */
  {
    kind: "api", slug: "api-stripe", name: "Stripe API",
    tagline: "The payments API every other payments API is compared to",
    description:
      "Charges, subscriptions, invoicing, Connect and Tax. The documentation is the actual product advantage — idempotency keys, test clocks and webhook replay are all first-class rather than bolted on.",
    categories: ["api-payments"], tags: ["payments", "subscriptions", "webhooks", "idempotency"],
    homepage: "https://stripe.com", docs: "https://docs.stripe.com/api",
    npm: "stripe",
    license: "Commercial", licenseBucket: "commercial", pricing: "paid",
    priceNote: "2.9% + 30¢ per successful charge, no monthly fee",
    stack: hosted,
    details: {
      baseUrl: "https://api.stripe.com/v1", auth: "Secret key (Bearer)",
      rateLimit: "100 read / 100 write requests per second in live mode",
      openapi: true,
    },
    color: "#635bff", monogram: "ST", featured: true, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-resend", name: "Resend API",
    tagline: "Transactional email with a sane developer experience",
    description:
      "Send, batch, schedule and track email, with React Email for the templates. Deliverability tooling and domain setup are guided rather than left as an exercise.",
    categories: ["api-email"], tags: ["email", "transactional", "react-email", "webhooks"],
    homepage: "https://resend.com", docs: "https://resend.com/docs/api-reference",
    npm: "resend",
    license: "Commercial", licenseBucket: "commercial", pricing: "freemium",
    priceNote: "3,000 emails/month free; Pro from $20/mo",
    stack: hosted,
    details: {
      baseUrl: "https://api.resend.com", auth: "API key (Bearer)",
      rateLimit: "2 requests per second by default",
      openapi: true,
    },
    color: "#0b0b0f", monogram: "RS", featured: false, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-anthropic", name: "Claude API",
    tagline: "Messages, tools, streaming and prompt caching",
    description:
      "Anthropic's Messages API: multi-turn conversations, tool use, structured output, streaming and prompt caching. The caching is the part that changes architecture decisions — a long system prompt stops being expensive.",
    categories: ["api-ai"], tags: ["llm", "tools", "streaming", "caching", "anthropic"],
    homepage: "https://www.anthropic.com/api", docs: "https://docs.anthropic.com/en/api",
    npm: "@anthropic-ai/sdk",
    license: "Commercial", licenseBucket: "commercial", pricing: "paid",
    priceNote: "Per-token, varying by model",
    stack: hosted,
    details: {
      baseUrl: "https://api.anthropic.com/v1", auth: "API key header",
      rateLimit: "Per-organisation token and request limits by tier",
      openapi: true,
    },
    color: "#d97757", monogram: "AN", featured: true, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-github", name: "GitHub API",
    tagline: "REST and GraphQL over everything on GitHub",
    description:
      "Repos, issues, pull requests, actions, packages and org administration. The GraphQL endpoint is worth the learning curve for anything that would otherwise be a dozen REST calls.",
    categories: ["api-dev"], tags: ["git", "issues", "actions", "graphql", "rest"],
    homepage: "https://github.com", docs: "https://docs.github.com/rest",
    npm: "octokit",
    license: "Commercial", licenseBucket: "commercial", pricing: "freemium",
    priceNote: "Free with rate limits; higher limits for apps and enterprise",
    stack: hosted,
    details: {
      baseUrl: "https://api.github.com", auth: "PAT, OAuth or GitHub App",
      rateLimit: "5,000 requests/hour authenticated; 60 unauthenticated",
      openapi: true,
    },
    color: "#0b0b0f", monogram: "GH", featured: false, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-mapbox", name: "Mapbox APIs",
    tagline: "Maps, geocoding, routing and isochrones",
    description:
      "Vector tiles, search, directions and matrix routing. The styling control is the differentiator — a Mapbox map can be made to look like part of your product rather than an embedded foreign object.",
    categories: ["api-maps"], tags: ["maps", "geocoding", "routing", "vector-tiles"],
    homepage: "https://www.mapbox.com", docs: "https://docs.mapbox.com/api",
    npm: "@mapbox/mapbox-sdk",
    license: "Commercial", licenseBucket: "commercial", pricing: "freemium",
    priceNote: "Generous free tier, then per-request",
    stack: hosted,
    details: {
      baseUrl: "https://api.mapbox.com", auth: "Access token",
      rateLimit: "Varies by endpoint; 600/min for geocoding",
    },
    color: "#4264fb", monogram: "MB", featured: false, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-cloudinary", name: "Cloudinary",
    tagline: "Upload once, transform in the URL forever",
    description:
      "Image and video storage with transformations expressed in the URL — resize, crop, format-negotiate and optimise without a build step or a re-upload.",
    categories: ["api-media"], tags: ["images", "video", "transformations", "cdn"],
    homepage: "https://cloudinary.com", docs: "https://cloudinary.com/documentation",
    npm: "cloudinary",
    license: "Commercial", licenseBucket: "commercial", pricing: "freemium",
    priceNote: "Free tier by monthly credits; paid plans by usage",
    stack: hosted,
    details: {
      baseUrl: "https://api.cloudinary.com/v1_1", auth: "API key and secret",
      rateLimit: "500 admin API calls/hour on free plans",
    },
    color: "#3448c5", monogram: "CL", featured: false, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-deepgram", name: "Deepgram",
    tagline: "Speech to text, streaming and fast",
    description:
      "Transcription with real-time streaming, diarisation and word-level timestamps. The latency is what makes live captioning and voice agents feel responsive rather than laggy.",
    categories: ["api-ai", "api-media"], tags: ["speech", "transcription", "streaming", "diarisation"],
    homepage: "https://deepgram.com", docs: "https://developers.deepgram.com",
    npm: "@deepgram/sdk",
    license: "Commercial", licenseBucket: "commercial", pricing: "freemium",
    priceNote: "Free credits to start, then per minute of audio",
    stack: hosted,
    details: {
      baseUrl: "https://api.deepgram.com/v1", auth: "API key",
      rateLimit: "Concurrency limits by plan",
    },
    color: "#13ef93", monogram: "DG", featured: false, verified: true, status: "live",
  },
  {
    kind: "api", slug: "api-clerk", name: "Clerk API",
    tagline: "Users, sessions, organisations and passkeys",
    description:
      "Backend API behind Clerk's components: users, sessions, organisations, invitations and JWT templates. Useful on its own if you want their identity model without their UI.",
    categories: ["api-auth"], tags: ["auth", "sessions", "organizations", "jwt"],
    homepage: "https://clerk.com", docs: "https://clerk.com/docs/reference/backend-api",
    npm: "@clerk/backend",
    license: "Commercial", licenseBucket: "commercial", pricing: "freemium",
    priceNote: "Free to 10,000 monthly active users",
    stack: hosted,
    details: {
      baseUrl: "https://api.clerk.com/v1", auth: "Secret key (Bearer)",
      rateLimit: "Per-instance limits, documented per endpoint",
      openapi: true,
    },
    color: "#6c47ff", monogram: "CK", featured: false, verified: true, status: "live",
  },

  /* ======================================================================
     REPOSITORIES
     ====================================================================== */
  {
    kind: "repo", slug: "repo-public-apis", name: "public-apis",
    tagline: "A collective list of free APIs, kept genuinely current",
    description:
      "The index everyone lands on when they need a free API for a side project. Its value is the maintenance: dead entries get pruned, which is what separates it from the hundreds of forks.",
    categories: ["repo-awesome"], tags: ["apis", "index", "free", "reference"],
    repo: "https://github.com/public-apis/public-apis",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: hosted,
    details: { language: "Python", shape: "Awesome list" },
    color: "#22c55e", monogram: "PA", featured: false, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-system-design-primer", name: "system-design-primer",
    tagline: "Learn how to design large-scale systems",
    description:
      "The reference people actually read before a design interview, and quietly useful afterwards. Diagrams, trade-offs and worked exercises rather than a list of buzzwords.",
    categories: ["repo-learning"], tags: ["architecture", "interviews", "scalability", "reference"],
    repo: "https://github.com/donnemartin/system-design-primer",
    license: "CC-BY-4.0", licenseBucket: "free-personal", pricing: "free",
    stack: hosted,
    details: { language: "Python", shape: "Learning resource" },
    color: "#0ea5e9", monogram: "SD", featured: false, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-build-your-own-x", name: "build-your-own-x",
    tagline: "Rebuild the things you use, from scratch",
    description:
      "Step-by-step guides to writing your own git, database, shell, regex engine or operating system. The fastest way to stop treating a tool as magic is to build a bad version of it.",
    categories: ["repo-learning"], tags: ["tutorials", "from-scratch", "fundamentals"],
    repo: "https://github.com/codecrafters-io/build-your-own-x",
    license: "CC-BY-4.0", licenseBucket: "free-personal", pricing: "free",
    stack: hosted,
    details: { language: "Markdown", shape: "Learning resource" },
    color: "#f59e0b", monogram: "BX", featured: true, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-biome", name: "biome",
    tagline: "One Rust toolchain for formatting and linting",
    description:
      "Formatter and linter in a single fast binary, aiming to replace the Prettier plus ESLint pairing. Migration is the honest friction — the rule coverage is close but not identical.",
    categories: ["repo-cli", "repo-libraries"], tags: ["rust", "linter", "formatter", "toolchain"],
    homepage: "https://biomejs.dev",
    repo: "https://github.com/biomejs/biome",
    npm: "@biomejs/biome",
    docs: "https://biomejs.dev/guides/getting-started",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: { language: "Rust", shape: "CLI" },
    color: "#60a5fa", monogram: "BI", featured: false, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-create-t3-app", name: "create-t3-app",
    tagline: "The typesafe Next.js starter, with opinions stated out loud",
    description:
      "Scaffolds Next.js with TypeScript, tRPC, Prisma, Tailwind and auth — and each piece is optional. The docs explaining why each choice was made are more valuable than the generator itself.",
    categories: ["repo-starters"], tags: ["nextjs", "trpc", "typesafe", "scaffold"],
    homepage: "https://create.t3.gg",
    repo: "https://github.com/t3-oss/create-t3-app",
    npm: "create-t3-app",
    docs: "https://create.t3.gg/en/introduction",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: { language: "TypeScript", shape: "Starter" },
    color: "#e935c1", monogram: "T3", featured: false, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-bun", name: "bun",
    tagline: "Runtime, bundler, test runner and package manager in one",
    description:
      "A JavaScript runtime built on JavaScriptCore that also installs packages, bundles and runs tests. Startup time and install speed are the reasons people try it; Node compatibility is the reason they stay or leave.",
    categories: ["repo-frameworks", "repo-cli"], tags: ["runtime", "zig", "bundler", "package-manager"],
    homepage: "https://bun.sh",
    repo: "https://github.com/oven-sh/bun",
    npm: "bun",
    docs: "https://bun.sh/docs",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: { language: "Zig", shape: "Runtime" },
    color: "#fbf0df", monogram: "BU", featured: true, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-vite", name: "vite",
    tagline: "The dev server everything else now builds on",
    description:
      "Native ESM in development, Rollup for production, and a plugin API that most of the ecosystem has standardised on. The reason your framework's dev server starts instantly.",
    categories: ["repo-frameworks"], tags: ["bundler", "dev-server", "esm", "rollup"],
    homepage: "https://vite.dev",
    repo: "https://github.com/vitejs/vite",
    npm: "vite",
    docs: "https://vite.dev/guide",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: { language: "TypeScript", shape: "Build tool" },
    color: "#646cff", monogram: "VI", featured: false, verified: true, status: "live",
  },
  {
    kind: "repo", slug: "repo-modelcontextprotocol-servers", name: "modelcontextprotocol/servers",
    tagline: "The reference MCP servers, and the pattern to copy",
    description:
      "Filesystem, fetch, memory, git and more, maintained alongside the protocol. Worth cloning less for the servers than for the shape — it is the clearest example of how an MCP server should be structured.",
    categories: ["repo-ai", "repo-libraries"], tags: ["mcp", "reference", "agents", "protocol"],
    repo: "https://github.com/modelcontextprotocol/servers",
    docs: "https://modelcontextprotocol.io/docs",
    license: "MIT", licenseBucket: "mit", pricing: "open-source",
    stack: cli,
    details: { language: "TypeScript", shape: "Reference implementation" },
    color: "#d97757", monogram: "MS", featured: true, verified: true, status: "live",
  },
];

export const extraListings: Listing[] = raw.map(hydrate);
