import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { IconTileStack } from "@/components/surface/icon-tile";
import { SectionHeading } from "@/components/surface/section-heading";
import { getListings, getStacks } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import type { Listing } from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Stacks",
  description:
    "Curated sets that are actually installable — an install plan and an agent manifest, not a list of links.",
  path: "/stacks",
});

export default async function StacksPage(): Promise<ReactNode> {
  const [stacks, all] = await Promise.all([getStacks(50), getListings({ limit: 500 })]);
  const bySlug = new Map(all.items.map((l) => [l.slug, l]));

  return (
    <div className="mx-auto max-w-[86rem] px-5 py-8 sm:px-8">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-wider text-foreground/40">
          Stacks
        </p>
        <h1 className="mt-2 font-serif text-[32px] font-medium leading-tight">
          Collections that do something
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Every other directory&apos;s collections are a list of links. A stack
          here compiles to an install plan you can run and a manifest your agent
          can read.
        </p>
      </header>

      <div className="mt-10">
        <SectionHeading title={`${stacks.length} stacks`} />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stacks.map((stack) => {
            const tiles = stack.items
              .map((item) => bySlug.get(item.slug))
              .filter((l): l is Listing => Boolean(l))
              .map((l) => ({ monogram: l.monogram, color: l.color }));
            return (
              <Link
                key={stack.slug}
                href={`/stacks/${stack.slug}`}
                className="t-lift flex h-full flex-col rounded-sm border border-border bg-muted/50 p-5 hover:bg-muted dark:border-transparent"
              >
                <IconTileStack items={tiles} />
                <h2 className="mt-5 text-[18px] font-semibold leading-snug tracking-tight">
                  {stack.name}
                </h2>
                <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-muted-foreground">
                  {stack.description}
                </p>
                <p className="mt-auto pt-5 text-right text-[13px] text-foreground/50">
                  {stack.items.length} items
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
