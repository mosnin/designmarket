import type { ReactNode } from "react";
import { brandInk } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

/**
 * Generated card art.
 *
 * Deliberately not a screenshot. Directories are wallpapered with stale
 * screenshots of marketing sites, which tell you what a project's homepage
 * looked like once and nothing about the thing itself. A monogram on the
 * project's own brand colour is honest about being a placeholder, and on
 * listings that have components the live preview replaces it entirely.
 */
export function CardArt({
  monogram,
  color,
  className,
  children,
}: {
  monogram: string;
  color: string;
  className?: string;
  children?: ReactNode;
}): ReactNode {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-dots",
        className
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 7%, var(--surface))`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(120% 80% at 50% 120%, color-mix(in oklab, ${color} 22%, transparent), transparent 70%)`,
        }}
      />
      {children ?? (
        <span
          className="relative select-none font-mono text-2xl font-semibold tracking-tight"
          style={{ color: brandInk(color) }}
        >
          {monogram}
        </span>
      )}
    </div>
  );
}
