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
        "relative flex items-center justify-center overflow-hidden",
        // Flat and near-white in light; the glow only earns its place against
        // a dark surface.
        "bg-muted dark:bg-dots",
        className
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 4%, var(--surface-2))`,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 hidden opacity-70 dark:block"
        style={{
          background: `radial-gradient(120% 80% at 50% 120%, color-mix(in oklab, ${color} 22%, transparent), transparent 70%)`,
        }}
      />
      {children ?? (
        <span
          className="relative select-none font-mono font-serif text-3xl font-medium"
          style={{ color: brandInk(color) }}
        >
          {monogram}
        </span>
      )}
    </div>
  );
}
