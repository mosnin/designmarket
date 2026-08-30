"use client";

import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { getRegistryEntry } from "@/components/registry";
import { tokensToCssVars } from "@/lib/preview-protocol";
import { useThemeMorph } from "@/lib/theme-morph";
import { cn } from "@/lib/utils";

/**
 * A live component rendered inline rather than in an iframe.
 *
 * Cards get this; detail pages get the iframe. Twenty-four documents in a grid
 * would make the marketplace unscrollable, and a card does not need the frame's
 * isolation — it needs to be real, cheap and morphed with everyone else.
 *
 * Interaction is off by design: a card is a thumbnail you click, and a select
 * that opened a portal from inside a grid cell would escape the card entirely.
 */
export function InlinePreview({
  registryKey,
  props,
  className,
  scale,
  fitHeight,
  interactive = false,
}: {
  registryKey: string;
  props?: Record<string, unknown>;
  className?: string;
  scale?: number;
  /** Shrink the component so its natural height fits this many pixels. */
  fitHeight?: number;
  /**
   * Cards are thumbnails and stay inert; the compare canvas is the opposite —
   * half the point of putting two components side by side is opening both.
   */
  interactive?: boolean;
}): ReactNode {
  const entry = getRegistryEntry(registryKey);
  const { tokens } = useThemeMorph();
  const { resolvedTheme } = useTheme();

  if (!entry) return null;

  // A card is smaller than a playground, so tall components are scaled down to
  // fit rather than cropped — a cropped preview is a screenshot with extra
  // steps, and shows you the least interesting corner of the component.
  const natural = entry.height ?? 240;
  const fitted = fitHeight ? Math.min(1, fitHeight / natural) : 1;
  const effectiveScale = scale ?? fitted;

  const vars = tokensToCssVars(
    resolvedTheme === "dark" ? tokens.dark : tokens.light
  );

  return (
    <div
      {...(interactive ? {} : { "aria-hidden": true, inert: true })}
      style={
        {
          ...vars,
          ...(effectiveScale !== 1
            ? {
                transform: `scale(${effectiveScale})`,
                transformOrigin: "center",
                width: `${100 / effectiveScale}%`,
              }
            : {}),
        } as React.CSSProperties
      }
      className={cn(
        "flex w-full items-center justify-center overflow-hidden bg-pv-background p-4 text-pv-foreground",
        interactive ? "" : "pointer-events-none",
        className
      )}
    >
      {entry.render(props ?? {})}
    </div>
  );
}
