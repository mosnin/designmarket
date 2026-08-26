import type { ReactNode } from "react";
import { ActiveFilters } from "@/components/facets/active-filters";
import { FacetRail } from "@/components/facets/facet-rail";
import { MobileFilters } from "@/components/browse/mobile-filters";
import { Pagination } from "@/components/browse/pagination";
import { SortMenu } from "@/components/sort-menu";
import { countActiveFacets, type SearchParamsInput } from "@/lib/search-params";
import type { SectionId } from "@/lib/taxonomy";
import type { SortKey } from "@/lib/types";
import { cn, pluralize } from "@/lib/utils";

export function BrowsePage({
  title,
  description,
  eyebrow,
  pathname,
  params,
  active,
  counts,
  sort,
  total,
  page,
  limit,
  noun = "result",
  sectionId,
  children,
  aside,
}: {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  pathname: string;
  params: SearchParamsInput;
  active: Record<string, string[]>;
  counts?: Record<string, Record<string, number>>;
  sort?: SortKey | undefined;
  total: number;
  page: number;
  limit: number;
  noun?: string;
  /** narrows the facet rail to the facets that mean something here */
  sectionId?: SectionId;
  children: ReactNode;
  /** extra content above the facet rail, e.g. a component-kind filter */
  aside?: ReactNode;
}): ReactNode {
  const activeCount = countActiveFacets(active);
  const rail = (
    <>
      {aside}
      <FacetRail
        pathname={pathname}
        params={params}
        active={active}
        {...(counts ? { counts } : {})}
        {...(sectionId ? { sectionId } : {})}
      />
    </>
  );

  return (
    <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-6 lg:py-8">
      <header>
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-mono font-medium tabular-nums text-foreground">
            {total.toLocaleString()}
          </span>{" "}
          {pluralize(total, noun)}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <MobileFilters activeCount={activeCount}>{rail}</MobileFilters>
          <SortMenu
            pathname={pathname}
            params={params}
            {...(sort ? { current: sort } : {})}
          />
        </div>
      </div>

      {activeCount > 0 ? (
        <div className="mt-3">
          <ActiveFilters pathname={pathname} params={params} active={active} />
        </div>
      ) : null}

      <div className={cn("mt-5 gap-8 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)]")}>
        <div className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] max-h-[calc(100dvh-var(--header-h)-3rem)] overflow-y-auto pr-2 scrollbar-thin">
            {rail}
          </div>
        </div>

        <div className="min-w-0">
          {children}
          <Pagination
            pathname={pathname}
            params={params}
            page={page}
            total={total}
            limit={limit}
          />
        </div>
      </div>
    </div>
  );
}

export function ResultGrid({
  children,
  dense,
}: {
  children: ReactNode;
  dense?: boolean;
}): ReactNode {
  return (
    <div
      className={cn(
        "grid gap-3.5",
        dense
          ? "sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
          : "sm:grid-cols-2 xl:grid-cols-3"
      )}
    >
      {children}
    </div>
  );
}
