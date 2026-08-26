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

## Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Next dev server |
| `npm run dev:all` | Convex + Next together |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run seed` | Load seed content into Convex |
