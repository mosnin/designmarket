# Vitrine — build plan

> **Vitrine** _(vee-TREEN)_ — a glass display case in which things are shown running, not photographed.
> Working name. It lives in one place (`lib/config.ts → siteConfig.name`); renaming is a one-line change.
> Alternates considered: Showroom, Kitbash, Agora, Substrate.

**Tagline:** _Every component, running._
**One line:** A free marketplace for AI-era UI — where every component renders live, in your design tokens, and your coding agent can shop here too.

---

## 1. Why this exists (and why it is not Toolfolio)

Toolfolio, Product Hunt, and the long tail of "awesome-x" lists all stop at the same wall: **they show you a picture of a thing and a link to somewhere else.** You leave the site to find out whether the thing is any good, whether it works with your stack, what it costs you in bundle size, and what it looks like in your brand.

Vitrine's bet is that the marketplace itself should be the evaluation environment.

### The five things nobody else does

| # | Feature | Why it is defensible |
|---|---|---|
| 1 | **The Render Layer** — every UI listing runs live in a sandboxed frame, with a prop playground, viewport resizer, and copy/install panel. Not a screenshot. | Requires a real sandbox + registry architecture. Directories are built on image uploads; retrofitting execution is a rewrite. |
| 2 | **Theme Morph** — paste your CSS variables (or a shadcn `globals.css`, or a Tailwind config) and *every* component on the site instantly re-renders in your brand. Browse the market as if it were already your app. | This is the "try before you buy" moment that converts. Impossible without #1. |
| 3 | **Component-level index** — you don't browse *libraries*, you browse ~thousands of *individual components* across all of them. "Show me every date-range picker that works with React 19 + RSC." | Fine-grained indexing is a data-model decision made on day one. Library-level directories can't decompose after the fact. |
| 4 | **Stack Compatibility Graph** — first-class facets for React version, RSC/server components, Tailwind v3 vs v4, TypeScript, a11y, license, bundle size, framework (Next/Remix/Vite/Astro). | Solves the actual daily pain: *"will this work in my repo?"* Everyone else sorts by upvotes. |
| 5 | **Agent-native (MCP, $9/mo)** — the same index served to coding agents over MCP, with install plans, source, peer deps, license checks, and compatibility answers. | The marketplace where the *buyer* is increasingly a machine. Built into the data model as "agent manifests", not bolted on. |

### Supporting concepts

- **Ship Score** — an objective 0–100 grade per listing computed from facts (license clarity, freshness, a11y notes, dependency count, bundle size, TS types, docs, maintenance). Product Hunt is upvote theater; Vitrine grades on evidence, and shows the arithmetic.
- **Stacks** — a saved collection that is *installable*. A curated board becomes `npx vitrine add <stack>` and an MCP resource. Collections that do something.
- **Compare canvas** — pin 2–4 components of the same kind and render them side by side, simultaneously, in one theme.
- **Remix** — tweak props/code in the playground and save the variant to your account. Free accounts get this.
- **The Drop** — one curated daily set (Toolfolio's "Tools Daily", but with live previews). Retention loop.
- **Provenance** — license, repo, last commit, maintainer, npm downloads, and "who added this" on every card. Trust is a feature.

### No invented data

The catalogue indexes **third-party platforms**, not our own products, and it
never shows a number it cannot source.

- Descriptive fields — name, tagline, description, categories, stack facets,
  licence — are authored and verifiable.
- Every **figure** is fetched: `scripts/fetch-facts.mjs` populates
  `lib/seed/facts.generated.json` from the npm registry, the npm downloads API
  and bundlephobia; `convex/ingest.ts` refreshes the same fields at runtime and
  adds GitHub stars, last push and open issues. A daily cron keeps them fresh.
- A figure we cannot confirm is **absent**, not estimated. Ship Score marks
  that dimension N/A and drops it from the denominator; the UI says "not
  fetched yet" and shows `fetchedAt` so you know how old the rest is.
- On-site engagement — views, saves, votes — starts at zero and is earned from
  real events. Trending therefore leans on off-site adoption and release
  recency until the site has traffic of its own, rather than on seeded numbers.

### How things get into the catalogue

Two paths, one pipeline. Both write to the same `listings`/`components` tables;
they differ only in who is trusted and what happens on save.

| | **Submit** (`/submit`) | **Admin** (`/admin`) |
| --- | --- | --- |
| Who | Anyone with a free account | `role: admin` or `moderator` |
| Saves as | `status: pending` — invisible to the public | `status: live` immediately, or draft |
| Flow | Guided multi-step form: identity → categories → stack facets → components → preview | Full editor, every field, no hand-holding |
| Assist | Paste a GitHub or npm URL and the form pre-fills name, licence, stars, downloads, last commit, dependency count and TypeScript support | Same importer, plus bulk paste |
| Ship Score | Computed live as you fill the form, so contributors can see what's missing | Same, plus an override note field |
| After save | Lands in `/admin/queue`; submitter tracks it at `/me/submissions` | Live |

The admin dashboard is also the operational surface: schedule The Drop, promote
things to featured, verify a listing, change a user's role or plan, and revoke
API keys.

**Role model.** `profiles.role` is `member | moderator | admin`. Moderators can
approve, reject and edit listings. Admins additionally manage users, roles,
plans and drops. The first account to sign up on a fresh deployment is
bootstrapped to `admin`; after that it is granted explicitly.

### Audience & access

- **Logged out:** browse, search, filter, render every component, copy code. No wall. This is how the market gets seeded.
- **Free account:** bookmark, boards, remixes, submit libraries/components/tools, profile.
- **Pro ($9/mo):** MCP server + API keys, unlimited private boards, bulk install plans, compatibility API.

---

## 2. Information architecture

```
/                       Explore (logged-in shell) · marketing landing (logged out)
/explore                Faceted feed — everything
/components             Component-level index (the differentiator)
/components/[slug]      Component detail + live render + playground
/libraries              UI library index
/libraries/[slug]       Library detail + all its components rendered
/tools                  AI tool index
/tools/[slug]           Tool detail
/c/[category]           Category page (Product-Hunt-style, design-heavy)
/drop                   The Drop — daily curated set
/compare                Compare canvas
/stacks                 Installable collections
/stacks/[slug]          Stack detail + install plan + agent manifest
/u/[handle]             Public profile
/me/*                   Bookmarks, boards, remixes, submissions, settings
/pricing                Free vs Pro
/mcp                    MCP connect docs + API keys
/preview/*              Sandbox render target (framed, no chrome)

/submit                 Public submission flow — anyone with a free account
/submit/[kind]          Library · component · AI tool · resource
/me/submissions         Your submissions and their moderation state

/admin                  Owner/moderator dashboard (role-gated)
/admin/listings         All listings, any status, bulk actions
/admin/listings/new     Create a listing by hand
/admin/listings/[slug]  Full editor — facts, facets, categories, components
/admin/components       Component records and their preview mode
/admin/queue            Submission moderation queue
/admin/drops            Schedule The Drop
/admin/users            Roles, plans, API keys
```

## 3. Categories (Product-Hunt breadth, design-first depth)

**UI & Design** — Component libraries · Design systems · Icons · Illustrations · Fonts & type · Color & palettes · Animation & motion · 3D & WebGL · Charts & data viz · Tables & data grids · Forms & inputs · Blocks & sections · Landing page kits · Dashboard kits · Email templates · Templates & starters · Figma resources · Mockups · Backgrounds & patterns · Cursors & micro-interactions

**AI** — AI design tools · AI coding agents · Prompt tools · Image generation · Video generation · Audio & voice · LLM infrastructure · RAG & vector DBs · Agent frameworks · MCP servers · Evals & observability · Fine-tuning

**Build** — Frameworks · Headless & primitives · CSS & styling · State management · Auth · Databases · Backends & BaaS · APIs · Hosting & deploy · Analytics · Payments · Email & messaging · Search · CMS · Testing · DevTools · No-code

**Craft** — Accessibility · Performance · Documentation · Design engineering · Portfolio & inspiration

## 4. Data model (Convex)

```
users            profile, handle, plan(free|pro), stripeCustomerId
listings         kind(library|tool|resource), slug, name, tagline, description,
                 repo, homepage, npm, license, pricing, categories[], tags[],
                 stack{}, facts{}, shipScore, status(draft|pending|live), authorId
components       listingId, slug, name, kind(button|table|...), source, registryKey,
                 props schema, deps[], a11y, previewMode(registry|remote|compiled)
categories       slug, name, group, icon, description, count
collections      "stacks" + "boards": ownerId, slug, name, visibility, items[]
bookmarks        userId, targetType, targetId
votes            userId, listingId
reviews          userId, listingId, rating, body
remixes          userId, componentId, props, sourceOverride
apiKeys          userId, hashedKey, prefix, label, lastUsedAt, scopes
submissions      moderation queue
events           analytics: views, renders, copies, installs
```

## 5. Technical decisions

- **Next.js 16 (App Router) + React 19 + TypeScript strict + Tailwind v4** — inherited from the supplied theme, which also donates its token system, motion helpers, and dark/light switch.
- **Convex** for database, realtime queries, auth (`@convex-dev/auth`: password + GitHub OAuth), scheduled jobs, and HTTP actions.
- **Render Layer:** registry components render inside `/preview/*` routes loaded in a sandboxed `<iframe>` — full React, full Tailwind, zero runtime compilation, no CDN dependency. Tokens are pushed in via `postMessage` for Theme Morph. Card grids render the same components inline instead, because a grid of iframes is a grid of documents. **User-submitted** source is compiled at runtime inside a hard-sandboxed frame; that lands with the submission flow in Phase 9, where user code first enters the system, rather than being built before there is any to run.
- **Graceful degradation:** when `NEXT_PUBLIC_CONVEX_URL` is unset, `lib/data.ts` serves a bundled seed dataset, so the app builds, previews, and deploys before a Convex deployment exists.
- **Billing:** Stripe Checkout + a Convex HTTP webhook that flips `users.plan`. Entirely env-gated.
- **MCP:** JSON-RPC over Streamable HTTP served from a Convex HTTP action, authenticated by `vt_live_*` API keys.
- **Hosting:** Vercel, `NEXT_PUBLIC_CONVEX_URL` + Convex deploy key in project env.

## 6. Phases

| # | Phase | Ships |
|---|---|---|
| 1 | Foundation & design system | Scaffold, tokens, primitives, app shell |
| 2 | Convex schema & data layer | Schema, functions, seed, fallback layer |
| 3 | Auth & accounts | Sign in/up, session, logged-out browsing |
| 4 | Explore, search & categories | Feed, facets, category pages, ⌘K, The Drop |
| 5 | Render Layer I | Sandbox, registry, playground, Theme Morph |
| 6 | Render Layer II | Compare canvas, remixes |
| 7 | Listing pages & Ship Score | Detail pages, grading, compat matrix, reviews |
| 8 | Bookmarks, boards & profiles | Saves, boards, public profiles |
| 9 | Submit flow & moderation | `/submit`, URL importer, queue, `/me/submissions`, compiled previews for submitted source |
| 10 | Admin dashboard | Manual listing/component editors, drops, users, roles |
| 11 | Stacks | Installable collections, install plans, manifests |
| 12 | Pro, Stripe & MCP | Pricing, checkout, API keys, MCP server |
| 13 | Marketing, SEO & polish | Landing, OG, a11y, states, mobile |
| 14 | Ship | Vercel config, docs, green build, PR |

## 7. Deploying

The app is designed to deploy **before** it has a backend. With no
`NEXT_PUBLIC_CONVEX_URL` set, `lib/data.ts` serves the bundled seed dataset and
the auth surfaces say accounts are unavailable — so a preview deployment is
browsable on the first push, and wiring Convex later is additive.

| Environment variable | Needed for | Without it |
| --- | --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | Live data, accounts, submissions | Seed data, read-only |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, OG images | Falls back to the configured domain |
| `STRIPE_*` | Pro checkout | Pricing page shows, checkout is disabled |

Convex environment variables (`AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`,
`SITE_URL`, `GITHUB_TOKEN`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) are
set on the deployment with `npx convex env set`, not in Vercel.
