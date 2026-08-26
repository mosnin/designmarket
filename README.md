# Vitrine

**Every component, running.**

A free marketplace for AI-era UI. Every component renders live, in your design
tokens — and your coding agent can shop here too.

See [`docs/PLAN.md`](docs/PLAN.md) for the product thesis, differentiators,
information architecture, and the phased build plan.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript strict |
| Styling | Tailwind v4, CSS-variable token system, light + dark |
| Data & auth | Convex (`@convex-dev/auth`) |
| Motion | `motion` |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local
npx convex dev      # provisions a deployment and fills NEXT_PUBLIC_CONVEX_URL
npm run dev
```

The app is designed to boot **without** a Convex deployment: when
`NEXT_PUBLIC_CONVEX_URL` is unset it serves a bundled seed dataset, so you can
browse and build immediately.

## Accounts

Auth is Convex Auth with two providers: GitHub, and email + password so that
saving a bookmark never costs an OAuth grant.

```bash
npx convex env set AUTH_GITHUB_ID <client-id>
npx convex env set AUTH_GITHUB_SECRET <client-secret>
npx convex env set SITE_URL http://localhost:3000
```

The **first account created on a deployment becomes an admin** — someone has to
be able to reach `/admin` on a fresh install. Everyone after that is a member
until promoted.

Browsing, searching and rendering components never require an account. Only
`/me`, `/submit` and `/admin` are gated, and with no deployment configured the
app still runs — it just says accounts are unavailable.

## Where the data comes from

The catalogue lists third-party projects. Descriptive fields are authored;
every number is fetched and stamped with `fetchedAt`.

```bash
node scripts/fetch-facts.mjs        # refresh lib/seed/facts.generated.json from npm
npx convex run ingest:refreshAll    # refresh a live deployment (adds GitHub data)
```

Set `GITHUB_TOKEN` in the Convex deployment to raise the GitHub API rate limit.
Anything a source cannot confirm is left absent rather than estimated.

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Next dev server |
| `npm run dev:all` | Convex + Next together |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run seed` | Load seed content into Convex |
| `npm run facts` | Refetch package facts from npm |
