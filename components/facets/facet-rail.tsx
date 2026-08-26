import { Icon } from "@/components/icon";
import Link from "next/link";
import type { ReactNode } from "react";
import { facetsForSection, type SectionId } from "@/lib/taxonomy";
import {
  clearFacetsHref,
  countActiveFacets,
  toggleFacetHref,
  type SearchParamsInput,
} from "@/lib/search-params";
import { cn } from "@/lib/utils";

/**
 * THE STACK COMPATIBILITY GRAPH, as a UI.
 *
 * Rendered entirely as links on the server: no client state, every filtered
 * view is a shareable URL, and it works with JavaScript disabled. The counts
 * come from the same query that produced the results, so a facet that would
 * return nothing says zero instead of leading you into an empty page.
 */
export function FacetRail({
  pathname,
  params,
  active,
  counts,
  className,
  sectionId,
}: {
  pathname: string;
  params: SearchParamsInput;
  active: Record<string, string[]>;
  /** facetId -> value -> number of results if this value were added */
  counts?: Record<string, Record<string, number>>;
  className?: string;
  sectionId?: SectionId;
}): ReactNode {
  const activeCount = countActiveFacets(active);
  // An RSC-safety filter is meaningless in the APIs section, and a facet that
  // can never match is worse than no facet at all.
  const facetDefs = facetsForSection(sectionId);

  return (
    <aside className={cn("flex flex-col gap-5", className)} aria-label="Filters">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
          Works with
        </h2>
        {activeCount > 0 ? (
          <Link
            href={clearFacetsHref(pathname, params)}
            className="text-[11px] font-medium text-accent hover:underline"
          >
            Clear {activeCount}
          </Link>
        ) : null}
      </div>

      {facetDefs.map((facet) => {
        const selected = active[facet.id] ?? [];
        return (
          <fieldset key={facet.id} className="min-w-0">
            <legend className="mb-1.5 text-[12px] font-medium text-foreground">
              {facet.label}
            </legend>
            <ul className="flex flex-col">
              {facet.options.map((option) => {
                const isOn = selected.includes(option.value);
                const count = counts?.[facet.id]?.[option.value];
                const empty = count === 0 && !isOn;
                return (
                  <li key={option.value}>
                    <Link
                      href={toggleFacetHref(pathname, params, facet.id, option.value)}
                      aria-pressed={isOn}
                      title={option.hint ?? option.label}
                      className={cn(
                        "group flex items-center gap-2 rounded-xs py-1 pl-0.5 pr-1.5 text-[13px] transition-colors",
                        isOn
                          ? "font-medium text-foreground"
                          : empty
                            ? "text-foreground/50/60"
                            : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors",
                          isOn
                            ? "border-accent bg-accent text-accent-foreground"
                            : "border-foreground/20 group-hover:border-accent"
                        )}
                      >
                        {isOn ? <Icon name="check" className="size-3" strokeWidth={3} /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {count !== undefined ? (
                        <span className="shrink-0 font-mono text-[11px] tabular-nums text-foreground/50">
                          {count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </aside>
  );
}
