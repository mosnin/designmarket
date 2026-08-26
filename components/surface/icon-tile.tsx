import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The app-icon square.
 *
 * Directories that look good are built on a strong, consistent left edge —
 * every row starts with the same square at the same size, so the eye scans
 * names instead of hunting for them. We have monograms rather than logos, so
 * they are rendered as solid brand colour with white type: a deliberate mark,
 * not a placeholder waiting for an upload.
 */
export function IconTile({
  monogram,
  color,
  size = "md",
  className,
}: {
  monogram: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}): ReactNode {
  const dims = {
    sm: "size-8 rounded-[9px] text-[10px]",
    md: "size-11 rounded-[13px] text-[13px]",
    lg: "size-14 rounded-[16px] text-base",
  }[size];

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 select-none items-center justify-center font-semibold tracking-tight",
        // A hairline inner edge keeps a dark tile from dissolving into a dark
        // background without drawing an outline around it.
        "ring-1 ring-inset ring-white/10",
        dims,
        className
      )}
      style={{
        background: `linear-gradient(160deg, ${color}, color-mix(in oklab, ${color} 72%, #000))`,
        color: "#fff",
      }}
    >
      {monogram}
    </span>
  );
}

/** Overlapping tiles, for a collection's contents at a glance. */
export function IconTileStack({
  items,
  max = 5,
}: {
  items: { monogram: string; color: string }[];
  max?: number;
}): ReactNode {
  const shown = items.slice(0, max);
  const extra = items.length - shown.length;
  return (
    <span className="flex items-center gap-1.5">
      {shown.map((item, index) => (
        <IconTile
          key={`${item.monogram}-${index}`}
          monogram={item.monogram}
          color={item.color}
          size="sm"
        />
      ))}
      {extra > 0 ? (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-muted text-[10px] font-medium text-muted-foreground">
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
