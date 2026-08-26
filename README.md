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

## The MCP server

The paid plan's reason to exist. It is one HTTP endpoint speaking JSON-RPC at
`https://<deployment>.convex.site/mcp`, authenticated with a bearer API key
minted in `/me/settings`.

Five tools, shaped around the question a coding agent actually has — never
"what is popular" but "what can I install into *this* project without breaking
it":

| Tool | Answers |
| --- | --- |
| `search_listings` | What fits my constraints? A library that needs React 19 is **removed** from an 18 project's results, not down-ranked — it is wrong, not less relevant. |
| `get_listing` | Everything known, including the Ship Score split into dimensions with the evidence behind each. |
| `get_component` | Usage snippet, install command, import line, props, a11y notes. |
| `install_plan` | A set of slugs → batched commands plus a resolved manifest. |
| `check_compatibility` | The specific conflicts — which two things disagree and about what — not a percentage. |

`install_plan` is built by `lib/install-plan.ts`, the same module the `/stacks`
pages render from, so an agent and a reader never get different answers about
the same listing.

Connect it:

```bash
claude mcp add --transport http vitrine \
  https://<deployment>.convex.site/mcp \
  --header "Authorization: Bearer vtr_your_key"
```

Keys are shown exactly once and stored as a SHA-256 — there is no reveal
button to build and no support flow that can recover one. Generation happens
in a Convex **action**, not a mutation: mutations are deterministic and
replayable, and a random secret made inside one can be made twice. Revoked
keys stay listed, because the usage counter is the only way to tell a leaked
key from an unused one after the fact.

## Billing

Optional. Stripe is called over its REST API with `fetch` — no SDK — and
webhook signatures are verified with Web Crypto HMAC in constant time, with a
five-minute freshness window so a replayed event cannot reinstate a cancelled
subscription.

```bash
npx convex env set STRIPE_SECRET_KEY sk_...
npx convex env set STRIPE_PRICE_ID_PRO_MONTHLY price_...
npx convex env set STRIPE_WEBHOOK_SECRET whsec_...
# point the Stripe webhook at https://<deployment>.convex.site/stripe/webhook
```

With these unset the app is identical except the upgrade button, which says so
plainly. An admin can still grant Pro from `/admin/members`.

## Submitting and moderating

`/submit` takes one field. Paste a GitHub repo or an npm package and the
importer reads the project — GitHub for the repo, the registry for the
package, the manifest for peer dependencies — and fills the draft from that.
Nothing in a listing is typed by its submitter, so nothing in it is a marketing
claim; anything unverifiable is listed as unverified rather than guessed. The
submitter sees their Ship Score, with the working, before they submit.

`/admin` splits two roles deliberately: a **moderator** decides what gets into
the index, an **admin** decides who gets to decide. Nothing fetched is writable
from either surface — status, featured and verified are human decisions;
download counts are not. Approving a listing schedules a fact refresh, because
the moment its numbers start being shown is the moment they should be true.

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
