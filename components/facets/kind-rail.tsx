import Link from "next/link";
import type { ReactNode } from "react";
import { componentKindLabel } from "@/lib/taxonomy";
import { setParamHref, type SearchParamsInput } from "@/lib/search-params";
import { cn } from "@/lib/utils";

/**
 * The component-kind filter — the axis that makes a component-level index
 * useful. "Show me every date-range picker" is the query no library-level
 * directory can answer.
 */
export function KindRail({
  pathname,
  params,
  current,
  counts,
}: {
  pathname: string;
  params: SearchParamsInput;
  current?: string | undefined;
  counts: Record<string, number>;
}): ReactNode {
  const kinds = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  return (
    <div className="mb-6">
      <h2 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
        Component kind
      </h2>
      <ul className="flex flex-col">
        <li>
          <Link
            href={setParamHref(pathname, params, "kind", null)}
            className={cn(
              "flex items-center gap-2 rounded-xs px-1 py-1 text-[13px] transition-colors",
              !current
                ? "font-medium text-accent"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="min-w-0 flex-1 truncate">All kinds</span>
            <span className="font-mono text-[11px] tabular-nums text-subtle-foreground">
              {Object.values(counts).reduce((a, b) => a + b, 0)}
            </span>
          </Link>
        </li>
        {kinds.map(([kind, count]) => (
          <li key={kind}>
            <Link
              href={setParamHref(pathname, params, "kind", kind)}
              className={cn(
                "flex items-center gap-2 rounded-xs px-1 py-1 text-[13px] transition-colors",
                current === kind
                  ? "font-medium text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="min-w-0 flex-1 truncate">
                {componentKindLabel(kind)}
              </span>
              <span className="font-mono text-[11px] tabular-nums text-subtle-foreground">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
