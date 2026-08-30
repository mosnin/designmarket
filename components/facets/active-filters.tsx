import { Icon } from "@/components/icon";
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
          className="inline-flex h-6 items-center gap-1.5 rounded-full border border-border px-2.5 text-[12px] font-medium text-foreground transition-colors hover:border-foreground/20"
        >
          <span className="text-foreground/50">{facetById.get(facetId)?.short}</span>
          {facetOptionLabel(facetId, value)}
          <Icon name="close" className="size-3" />
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
