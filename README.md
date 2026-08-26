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
