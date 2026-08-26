import { SearchX } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { facetById, facetOptionLabel } from "@/lib/taxonomy";
import { clearFacetsHref, toggleFacetHref, type SearchParamsInput } from "@/lib/search-params";

/**
 * An empty result is a dead end unless it tells you which filter caused it.
 * Rather than "no results", we name the narrowest constraint and offer to drop
 * exactly that one.
 */
export function EmptyResults({
  pathname,
  params,
  active,
  counts,
  query,
}: {
  pathname: string;
  params: SearchParamsInput;
  active: Record<string, string[]>;
  counts?: Record<string, Record<string, number>>;
  query?: string | undefined;
}): ReactNode {
  // The selected value that, on its own, returns the fewest results is the
  // most likely culprit.
  let culprit: { facetId: string; value: string; count: number } | null = null;
  for (const [facetId, values] of Object.entries(active)) {
    for (const value of values) {
      const count = counts?.[facetId]?.[value] ?? 0;
      if (!culprit || count < culprit.count) culprit = { facetId, value, count };
    }
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-surface-2/50 px-6 py-16 text-center">
      <SearchX className="size-6 text-subtle-foreground" strokeWidth={1.5} />
      <h2 className="mt-3 text-[15px] font-semibold">Nothing matches all of that</h2>

      {query ? (
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          No results for <span className="font-medium text-foreground">“{query}”</span>
          {Object.keys(active).length ? " with these filters applied" : ""}.
        </p>
      ) : culprit ? (
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">
            {facetById.get(culprit.facetId)?.label}:{" "}
            {facetOptionLabel(culprit.facetId, culprit.value)}
          </span>{" "}
          is the narrowest filter — nothing else in the catalogue satisfies it
          alongside the rest.
        </p>
      ) : (
        <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Nothing in the catalogue matches this combination yet.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {culprit ? (
          <Button variant="primary" size="sm" asChild>
            <Link href={toggleFacetHref(pathname, params, culprit.facetId, culprit.value)}>
              Drop that filter
            </Link>
          </Button>
        ) : null}
        {Object.keys(active).length ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={clearFacetsHref(pathname, params)}>Clear all filters</Link>
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/submit">Know something missing? Submit it</Link>
        </Button>
      </div>
    </div>
  );
}
