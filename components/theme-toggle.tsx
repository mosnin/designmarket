"use client";

import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/lib/use-mounted";

/**
 * One button, three states, cycled in the order people actually want them:
 * whatever you are looking at now → the other one → back to following the
 * system.
 *
 * The segmented control this replaces was a filled track holding a filled
 * thumb, parked in a translucent header — three nested surfaces to express a
 * single choice, in the corner of every page.
 */
const ORDER = ["light", "dark", "system"] as const;

export function ThemeToggle({ className }: { className?: string }): ReactNode {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const current = mounted ? ((theme ?? "system") as (typeof ORDER)[number]) : "system";
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]!;

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      onClick={() => setTheme(next)}
      // Announce the state, not the gesture — a screen reader user needs to
      // know what the theme is, and the label says what pressing does next.
      aria-label={`Theme: ${current}. Switch to ${next}.`}
      title={`Theme: ${current}`}
    >
      <Icon name={current === "system" ? "system" : current} size={16} />
    </Button>
  );
}
