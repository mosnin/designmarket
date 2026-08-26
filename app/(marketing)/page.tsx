import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { CardPreview } from "@/components/preview/card-preview";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { IconTile } from "@/components/surface/icon-tile";
import { FAQ } from "@/components/theme/faq";
import { Frame, SectionTitle } from "@/components/theme/frame";
import { ShaderHero } from "@/components/theme/shader-hero";
import { Button } from "@/components/ui/button";
import { getComponents, getListings, getStacks } from "@/lib/data";
import { listingHref } from "@/lib/links";
import { pageMetadata } from "@/lib/metadata";
import { canRender } from "@/lib/registry-manifest";
import { sections } from "@/lib/taxonomy";
import { PRO_PRICE_USD, siteConfig } from "@/lib/config";

export const metadata: Metadata = pageMetadata({
  title: siteConfig.tagline,
  description: siteConfig.description,
  path: "/",
});

const ease = "cubic-bezier(0.16,1,0.3,1)";

export default async function HomePage(): Promise<ReactNode> {
  const [live, newest, stacks, all] = await Promise.all([
    getComponents({ limit: 3, renderableOnly: true }),
    getListings({ limit: 8, sort: "newest" }),
    getStacks(3),
    getListings({ limit: 500 }),
  ]);

  const bySlug = new Map(all.items.map((l) => [l.slug, l]));
  const renderable = all.items.reduce((sum, l) => sum + l.componentCount, 0);

  return (
    <>
      <ShaderHero live={renderable} />

      {/* ------------------------------------------------ what it actually is */}
      <section className="w-full bg-background py-24 sm:py-32">
        <Frame edge="top">
          <div className="py-16">
            <SectionTitle
              lead="Directories show you a screenshot and a star count. Neither survives contact with your codebase. Here the component runs on the page, in your tokens, and every figure beside it was fetched from its source."
            >
              A catalogue you can
              <br />
              <span className="italic">actually run.</span>
            </SectionTitle>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {live.items.map((component, index) => {
                const parent = bySlug.get(component.listingSlug);
                return (
                  <Link
                    key={component.slug}
                    href={`/components/${component.slug}`}
                    style={{ transitionTimingFunction: ease, transitionDelay: `${index * 40}ms` }}
                    className="group flex flex-col overflow-hidden rounded-sm border border-border bg-muted/50 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-lg"
                  >
                    <div className="flex h-56 items-center justify-center bg-background sm:h-64">
                      {canRender(component) && component.registryKey ? (
                        <CardPreview registryKey={component.registryKey} fitHeight={200} />
                      ) : null}
                    </div>
                    <div className="flex flex-col p-6">
                      <h3 className="font-serif text-lg font-medium text-foreground">
                        {component.name}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {component.description}
                      </p>
                      <span className="mt-4 flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                        {parent ? `From ${parent.name}` : "Open it"}
                        <Icon
                          name="forward"
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </Frame>
      </section>


      {/* --------------------------------------------------------- the markets */}
      <section className="w-full bg-background py-24 sm:py-32">
        <Frame edge="bottom">
          <div className="pb-16">
            <SectionTitle eyebrow="The index">
              Six markets,
              <br />
              <span className="italic">one vocabulary.</span>
            </SectionTitle>

            <div className="mt-12 grid grid-cols-1 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
              {sections
                .filter((section) => section.hasCategories)
                .map((section) => (
                  <Link
                    key={section.id}
                    href={section.href}
                    className="group flex items-start gap-4 border-b border-foreground/10 py-6"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 font-serif text-lg font-medium text-foreground">
                        {section.label}
                        <Icon
                          name="forward"
                          size={15}
                          className="text-foreground/40 transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        {section.blurb}
                      </span>
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </Frame>
      </section>

      {/* ------------------------------------------------------------- stacks */}
      {stacks.length ? (
        <section className="w-full bg-muted py-24 sm:py-32">
          <div className="mx-auto max-w-270 px-8 sm:px-12">
            <SectionTitle
              eyebrow="Stacks"
              lead="Every other directory's collection is a list of links. A stack here compiles to an install plan you can paste and a manifest your agent can read."
            >
              Collections that
              <br />
              <span className="italic">do something.</span>
            </SectionTitle>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {stacks.map((stack) => (
                <Link
                  key={stack.slug}
                  href={`/stacks/${stack.slug}`}
                  className="group flex flex-col rounded-sm border border-border bg-background p-6 transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-lg"
                >
                  <h3 className="font-serif text-lg font-medium text-foreground">
                    {stack.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {stack.description}
                  </p>
                  <span className="mt-5 flex items-center gap-1 text-sm font-medium text-foreground/80 group-hover:text-foreground">
                    {stack.items.length} in this stack
                    <Icon
                      name="forward"
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ newest listings */}
      <section className="w-full bg-background py-24 sm:py-32">
        <Frame edge="top">
          <div className="py-16">
            <SectionTitle eyebrow="Recently indexed">
              What came in
              <br />
              <span className="italic">this week.</span>
            </SectionTitle>

            <ul className="mt-10 grid grid-cols-1 gap-x-12 md:grid-cols-2">
              {newest.items.map((listing) => (
                <li key={listing.slug} className="border-b border-foreground/10">
                  <Link
                    href={listingHref(listing)}
                    className="group flex items-center gap-4 py-4"
                  >
                    <IconTile monogram={listing.monogram} color={listing.color} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {listing.name}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                        {listing.tagline}
                      </span>
                    </span>
                    <ShipScoreChip listing={listing} />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Button variant="secondary" size="md" asChild>
                <Link href="/explore">
                  Browse everything
                  <Icon name="forward" size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </Frame>
      </section>

      {/* ---------------------------------------------------------------- FAQ */}
      <section className="w-full bg-background pb-24 sm:pb-32">
        <Frame>
          <SectionTitle eyebrow="Questions">
            The short
            <br />
            <span className="italic">answers.</span>
          </SectionTitle>
          <div className="mt-10">
            <FAQ
              items={[
                {
                  question: "Do I need an account?",
                  answer:
                    "No. Browsing, searching, rendering components and copying install commands all work logged out. An account adds saving, boards and submissions — nothing that gates reading the index.",
                },
                {
                  question: "Where do the numbers come from?",
                  answer:
                    "GitHub, the npm registry and bundlephobia, refreshed daily and stamped with the time they were fetched. Nothing is authored. If a source cannot confirm a figure it is left blank, and the Ship Score treats it as not-applicable rather than scoring it zero.",
                },
                {
                  question: "What is a Ship Score?",
                  answer:
                    "An 0–100 grade built only from evidence — licence, maintenance, adoption, accessibility, types, weight, dependencies and docs — never from votes. Every dimension shows its working, and a score standing on too little evidence is labelled provisional instead of flattering the entry.",
                },
                {
                  question: "How do the live previews work?",
                  answer:
                    "Each component runs in a sandboxed frame on its own token set. Paste your globals.css into Theme Morph and every preview on the site re-renders in your brand, which is the closest you can get to trying it in your app without installing it.",
                },
                {
                  question: `What does the $${PRO_PRICE_USD}/mo plan add?`,
                  answer:
                    "Machine access. An MCP server your coding agent connects to, API keys, and a compatibility endpoint you can call from CI. The catalogue itself stays free — the plan covers an agent querying it a thousand times a day, not a person reading it.",
                },
              ]}
            />
          </div>
        </Frame>
      </section>

      {/* ---------------------------------------------------------- final CTA */}
      <section className="relative flex w-full items-center justify-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center sm:px-8 sm:py-32">
          <h2 className="mx-auto max-w-lg font-serif text-4xl font-medium leading-tight text-foreground md:text-5xl">
            Stop reading screenshots.
          </h2>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-foreground/60">
            {renderable.toLocaleString()} components are running on this site
            right now. No account, no trial, no card.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" size="lg" asChild>
              <Link href="/components">
                Browse components
                <Icon name="forward" size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/mcp-connect">Connect your agent</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
