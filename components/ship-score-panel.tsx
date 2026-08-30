import type { ReactNode } from "react";
import { computeShipScore, gradeColor } from "@/lib/ship-score";
import type { Listing } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";

/**
 * SHIP SCORE, SHOWING ITS WORKING
 *
 * The promise of grading on evidence only holds if the evidence is visible.
 * Every dimension prints its points, its maximum and the fact behind it, and
 * dimensions that cannot apply are shown as N/A with the reason — because
 * "we could not measure this" is itself information about a listing.
 *
 * It is set as a meta column, not a dashboard: a label, a figure, a hairline.
 * The bar charts that used to sit under each row encoded nothing the numbers
 * beside them didn't already say, and eight of them stacked up read as a
 * progress dialog rather than a grade.
 */
export function ShipScorePanel({ listing }: { listing: Listing }): ReactNode {
  const score = computeShipScore(listing);
  const color = score.provisional ? "var(--muted-foreground)" : gradeColor(score.grade);

  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
        Ship Score
      </h2>

      <div className="mt-2 flex items-baseline gap-2">
        <span
          className="font-mono text-[28px] font-semibold leading-none tabular-nums"
          style={{ color }}
        >
          {score.score}
        </span>
        <span className="font-mono text-[13px] leading-none" style={{ color }}>
          {score.grade}
        </span>
        {score.provisional ? (
          <span className="text-[11px] leading-none text-foreground/50">
            provisional
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
        {score.provisional ? (
          <>
            Only {score.applicableMax} of 100 points could be evaluated for this
            listing, so the figure stands on less than usual.
          </>
        ) : (
          <>
            {score.earned} of {score.applicableMax} applicable points. Never
            influenced by votes.
          </>
        )}
      </p>

      <dl className="mt-4 divide-y divide-foreground/10 border-y border-border">
        {score.dimensions.map((dimension) => {
          const applies = dimension.points !== null;
          return (
            <div key={dimension.id} className="py-2.5">
              <div className="flex items-baseline gap-3">
                <dt
                  className={cn(
                    "text-[13px]",
                    applies ? "text-foreground" : "text-foreground/50"
                  )}
                >
                  {dimension.label}
                </dt>
                <dd className="ml-auto shrink-0 font-mono text-[12px] tabular-nums">
                  {applies ? (
                    <>
                      <span className="text-foreground">{dimension.points}</span>
                      <span className="text-foreground/50">/{dimension.max}</span>
                    </>
                  ) : (
                    <span className="text-foreground/50">N/A</span>
                  )}
                </dd>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-foreground/50">
                {dimension.note}
              </p>
            </div>
          );
        })}
      </dl>

      <p className="mt-2.5 text-[11px] leading-relaxed text-foreground/50">
        Computed from fetched facts, never from votes.
        {listing.facts.fetchedAt
          ? ` Refreshed ${timeAgo(listing.facts.fetchedAt)}.`
          : " These facts have not been fetched yet."}
      </p>
    </section>
  );
}
