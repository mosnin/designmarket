import type { ReactNode } from "react";
import { computeShipScore, gradeColor } from "@/lib/ship-score";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The grade, always shown with its number. A letter on its own invites people
 * to imagine a curve; the number is what we can actually defend.
 *
 * It carries no fill and no outline. Twenty coloured pills down a result grid
 * turn a scannable list into a scoreboard, and the score is meant to be a
 * detail you can glance past — the colour alone is enough to sort by.
 */
export function ShipScoreChip({
  listing,
  size = "sm",
  className,
}: {
  listing: Listing;
  size?: "sm" | "md";
  className?: string;
}): ReactNode {
  const { score, grade, applicableMax, provisional } = computeShipScore(listing);
  const color = provisional ? "var(--subtle-foreground)" : gradeColor(grade);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-baseline gap-1 font-mono font-medium tabular-nums",
        size === "sm" ? "text-[12px]" : "text-[13px]",
        className
      )}
      style={{ color }}
      title={
        provisional
          ? `Provisional: only ${applicableMax} of 100 points could be evaluated. Publish data would firm this up.`
          : `Ship Score ${score}/100, graded on ${applicableMax} applicable points`
      }
    >
      {score}
      <span className="text-[0.75em] opacity-70">{provisional ? "?" : grade}</span>
    </span>
  );
}
