"use client";

import { Icon } from "@/components/icon";

import { useTheme } from "next-themes";
import type { ReactNode } from "react";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const options = [
  { value: "light", icon: "light", label: "Light" },
  { value: "system", icon: "system", label: "System" },
  { value: "dark", icon: "dark", label: "Dark" },
] as const;

export function ThemeToggle({ className }: { className?: string }): ReactNode {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-2 p-0.5",
        className
      )}
    >
      {options.map(({ value, icon, label }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "flex size-6 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-surface text-foreground shadow-card"
                : "text-subtle-foreground hover:text-foreground"
            )}
          >
            <Icon name={icon} size={14} />
          </button>
        );
      })}
    </div>
  );
}
