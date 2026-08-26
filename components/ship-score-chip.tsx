import type { ReactNode } from "react";
import { computeShipScore, gradeColor } from "@/lib/ship-score";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * The grade, always shown with its number. A letter on its own invites people
 * to imagine a curve; the number is what we can actually defend.
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
  const color = provisional ? "var(--muted-foreground)" : gradeColor(grade);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full border font-mono font-medium tabular-nums",
        size === "sm" ? "h-5 pl-1 pr-2 text-[11px]" : "h-6 pl-1.5 pr-2.5 text-xs",
        className
      )}
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
        color,
      }}
      title={
        provisional
          ? `Provisional: only ${applicableMax} of 100 points could be evaluated. Publish data would firm this up.`
          : `Ship Score ${score}/100, graded on ${applicableMax} applicable points`
      }
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold",
          size === "sm" ? "size-3.5 text-[9px]" : "size-4 text-[10px]"
        )}
        style={{ backgroundColor: color, color: "var(--background)" }}
      >
        {grade}
      </span>
      {score}
      {provisional ? (
        <span className="-ml-0.5 text-[10px] leading-none opacity-70">?</span>
      ) : null}
    </span>
  );
}
