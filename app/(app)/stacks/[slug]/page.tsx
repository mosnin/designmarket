import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { CardPreview } from "@/components/preview/card-preview";
import { CodeBlock, CommandLine } from "@/components/preview/code-panel";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { IconTile } from "@/components/surface/icon-tile";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { getCollection, hydrateCollection } from "@/lib/data";
import { listingHref } from "@/lib/links";
import { pageMetadata } from "@/lib/metadata";
import { canRender } from "@/lib/registry-manifest";
import { buildInstallPlan, buildAgentManifest } from "@/lib/install-plan";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const stack = await getCollection(slug);
  if (!stack) return {};
  return pageMetadata({
    title: stack.name,
    description: stack.description,
    path: `/stacks/${slug}`,
  });
}

export default async function StackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactNode> {
  const { slug } = await params;
  const stack = await getCollection(slug);
  if (!stack) notFound();

  const { listings, components, notes } = await hydrateCollection(stack);
  const plan = buildInstallPlan(listings, components);
  const manifest = buildAgentManifest(stack, listings, components);

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-8 sm:px-8">
      <Link
        href="/stacks"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="back" size={14} />
        All stacks
      </Link>

      <header className="mt-4 max-w-3xl">
        <h1 className="text-[32px] font-semibold leading-tight tracking-tight">
          {stack.name}
        </h1>
        <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">
          {stack.description}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
            What&apos;s in it
          </h2>
          <ul className="mt-3 flex flex-col gap-1">
            {listings.map((listing) => (
              <li key={listing.slug}>
                <Link
                  href={listingHref(listing)}
                  className="t-press flex items-start gap-3 rounded-xl px-2 py-2.5 hover:bg-surface"
                >
                  <IconTile monogram={listing.monogram} color={listing.color} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-medium">
                        {listing.name}
                      </span>
                      <ShipScoreChip listing={listing} />
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                      {notes[listing.slug] ?? listing.tagline}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {components.length ? (
            <>
              <h2 className="mt-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                Components
                <LiveBadge />
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {components.map((component) => (
                  <Link
                    key={component.slug}
                    href={`/components/${component.slug}`}
                    className="t-lift overflow-hidden rounded-2xl border border-border bg-surface dark:border-transparent"
                  >
                    <div className="flex h-40 items-center justify-center bg-grid">
                      {canRender(component) && component.registryKey ? (
                        <CardPreview
                          registryKey={component.registryKey}
                          fitHeight={140}
                        />
                      ) : (
                        <span className="text-[12px] text-subtle-foreground">
                          links out
                        </span>
                      )}
                    </div>
                    <div className="p-3.5">
                      <p className="text-[14px] font-medium">{component.name}</p>
                      <p className="mt-0.5 text-[12px] text-muted-foreground">
                        {notes[component.slug] ?? component.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* ------------------------------------------------- the install plan */}
        <aside className="flex flex-col gap-6">
          <section>
            <h2 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              Install the whole stack
            </h2>
            <div className="flex flex-col gap-2">
              {plan.commands.map((command) => (
                <CommandLine key={command} command={command} />
              ))}
            </div>
            {plan.manual.length ? (
              <div className="mt-3 rounded-xl border border-border bg-surface p-3 dark:border-transparent">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                  Not installable from a terminal
                </p>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {plan.manual.map((item) => (
                    <li key={item.slug} className="text-[12px] text-muted-foreground">
                      <span className="text-foreground">{item.name}</span> — {item.why}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="mt-2 text-[11px] leading-relaxed text-subtle-foreground">
              Generated from what each listing actually publishes. Nothing here
              is guessed — a listing with no package says so instead of getting
              an invented command.
            </p>
          </section>

          <section>
            <h2 className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              Agent manifest
              <Badge variant="accent" size="sm">
                MCP
              </Badge>
            </h2>
            <CodeBlock
              code={JSON.stringify(manifest, null, 2)}
              filename={`${stack.slug}.json`}
              language="json"
            />
            <p className="mt-2 text-[11px] leading-relaxed text-subtle-foreground">
              This is what an agent receives when it asks for this stack over
              MCP — packages, licences, peer requirements and install method,
              already resolved.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
