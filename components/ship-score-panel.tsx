import type { ReactNode } from "react";
import { computeShipScore, gradeColor } from "@/lib/ship-score";
import type { Listing } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

/**
 * SHIP SCORE, SHOWING ITS WORKING
 *
 * The promise of grading on evidence only holds if the evidence is visible.
 * Every dimension prints its points, its maximum and the fact behind it, and
 * dimensions that cannot apply are shown as N/A with the reason — not hidden,
 * because "we could not measure this" is itself information about a listing.
 */
export function ShipScorePanel({ listing }: { listing: Listing }): ReactNode {
  const score = computeShipScore(listing);
  const color = score.provisional ? "var(--muted-foreground)" : gradeColor(score.grade);

  return (
    <section className="overflow-hidden rounded-md border border-border bg-surface">
      <header className="flex items-center gap-3 border-b border-border p-4">
        <span
          className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md font-mono"
          style={{
            backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
            color,
          }}
        >
          <span className="text-lg font-semibold leading-none tabular-nums">
            {score.score}
          </span>
          <span className="text-[9px] uppercase tracking-wider opacity-70">
            {score.grade}
          </span>
        </span>
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-tight">Ship Score</h2>
          <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">
            {score.provisional ? (
              <>
                Provisional — only {score.applicableMax} of 100 points could be
                evaluated for this listing.
              </>
            ) : (
              <>
                {score.earned} of {score.applicableMax} applicable points. Never
                influenced by votes.
              </>
            )}
          </p>
        </div>
      </header>

      <ul className="divide-y divide-border">
        {score.dimensions.map((dimension) => {
          const applies = dimension.points !== null;
          const ratio = applies ? (dimension.points ?? 0) / dimension.max : 0;
          return (
            <li key={dimension.id} className="px-4 py-2.5">
              <div className="flex items-baseline gap-3">
                <span
                  className={cn(
                    "text-[13px] font-medium",
                    applies ? "text-foreground" : "text-subtle-foreground"
                  )}
                >
                  {dimension.label}
                </span>
                <span className="ml-auto shrink-0 font-mono text-[12px] tabular-nums">
                  {applies ? (
                    <>
                      <span className="text-foreground">{dimension.points}</span>
                      <span className="text-subtle-foreground">/{dimension.max}</span>
                    </>
                  ) : (
                    <span className="text-subtle-foreground">N/A</span>
                  )}
                </span>
              </div>

              {applies ? (
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full transition-[width]"
                    style={{
                      width: `${Math.round(ratio * 100)}%`,
                      backgroundColor:
                        ratio >= 0.8
                          ? "var(--success)"
                          : ratio >= 0.5
                            ? "var(--accent)"
                            : "var(--warning)",
                    }}
                  />
                </div>
              ) : null}

              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {dimension.note}
              </p>
            </li>
          );
        })}
      </ul>

      <footer className="border-t border-border bg-surface-2 px-4 py-2.5">
        <p className="text-[11px] leading-relaxed text-subtle-foreground">
          Computed from fetched facts, never from votes.
          {listing.facts.fetchedAt
            ? ` Facts refreshed ${timeAgo(listing.facts.fetchedAt)}.`
            : " These facts have not been fetched yet."}
        </p>
      </footer>
    </section>
  );
}
