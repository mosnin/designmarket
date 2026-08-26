import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { facetById, facetOptionLabel } from "@/lib/taxonomy";
import {
  clearFacetsHref,
  toggleFacetHref,
  type SearchParamsInput,
} from "@/lib/search-params";

export function ActiveFilters({
  pathname,
  params,
  active,
}: {
  pathname: string;
  params: SearchParamsInput;
  active: Record<string, string[]>;
}): ReactNode {
  const chips = Object.entries(active).flatMap(([facetId, values]) =>
    values.map((value) => ({ facetId, value }))
  );
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {chips.map(({ facetId, value }) => (
        <Link
          key={`${facetId}:${value}`}
          href={toggleFacetHref(pathname, params, facetId, value)}
          className="inline-flex h-6 items-center gap-1.5 rounded-full border border-accent/30 bg-accent-muted px-2.5 text-[12px] font-medium text-accent transition-colors hover:border-accent/60"
        >
          <span className="text-accent/70">{facetById.get(facetId)?.short}</span>
          {facetOptionLabel(facetId, value)}
          <X className="size-3" />
        </Link>
      ))}
      <Link
        href={clearFacetsHref(pathname, params)}
        className="ml-1 text-[12px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
