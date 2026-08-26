import type { ReactNode } from "react";
import { LiveBadge } from "@/components/ui/badge";
import { getComponents, getListings, getStacks } from "@/lib/data";

export default async function HomePage(): Promise<ReactNode> {
  const [listings, components, stacks] = await Promise.all([
    getListings({ limit: 6 }),
    getComponents({ limit: 6, renderableOnly: true }),
    getStacks(4),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Explore</h1>
        <LiveBadge />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {listings.total} listings · {components.total} renderable components ·{" "}
        {stacks.length} stacks. The real feed lands next.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {listings.items.map((l) => (
          <li
            key={l.slug}
            className="rounded-md border border-border bg-surface p-4 shadow-card"
          >
            <p className="text-sm font-semibold">{l.name}</p>
            <p className="mt-1 text-[13px] text-muted-foreground">{l.tagline}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
