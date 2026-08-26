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
/** How many kinds to show before the list is collapsed behind a disclosure. */
const VISIBLE_KINDS = 12;

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
  const all = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  // The selected kind is always visible, even if it sits in the long tail —
  // otherwise the rail hides the thing you are currently looking at.
  const head = all.slice(0, VISIBLE_KINDS);
  const currentIsHidden =
    current !== undefined && !head.some(([kind]) => kind === current);
  const kinds = currentIsHidden
    ? [...head, ...all.filter(([kind]) => kind === current)]
    : head;
  const rest = all.slice(VISIBLE_KINDS).filter(([kind]) => kind !== current);

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

      {rest.length ? (
        <details className="group mt-1">
          <summary className="cursor-pointer list-none px-1 py-1 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
            <span className="group-open:hidden">
              + {rest.length} more {rest.length === 1 ? "kind" : "kinds"}
            </span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ul className="flex flex-col">
            {rest.map(([kind, count]) => (
              <li key={kind}>
                <Link
                  href={setParamHref(pathname, params, "kind", kind)}
                  className="flex items-center gap-2 rounded-xs px-1 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
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
        </details>
      ) : null}
    </div>
  );
}
