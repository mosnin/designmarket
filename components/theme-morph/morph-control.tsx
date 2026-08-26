"use client";

import { Icon } from "@/components/icon";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/input";
import { morphPresets, useThemeMorph } from "@/lib/theme-morph";
import { cn } from "@/lib/utils";

function Swatches({ preset }: { preset: (typeof morphPresets)[number] }): ReactNode {
  const keys = ["background", "primary", "secondary", "muted", "accent"] as const;
  return (
    <span className="flex items-center gap-0.5">
      {keys.map((k) => (
        <span
          key={k}
          className="size-3.5 rounded-[3px] border border-black/10 dark:border-white/10"
          style={{ background: preset.light[k] }}
        />
      ))}
    </span>
  );
}

export function MorphControl({ className }: { className?: string }): ReactNode {
  const { presetId, applyPreset, applyCss, reset, custom } = useThemeMorph();
  const [css, setCss] = useState("");
  const [open, setOpen] = useState(false);

  const active = custom
    ? "Your tokens"
    : (morphPresets.find((p) => p.id === presetId)?.name ?? "Vitrine");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
          aria-label="Theme Morph — render everything in your own tokens"
        >
          <Icon name="remix" className="size-4 text-accent" />
          <span className="hidden max-w-24 truncate sm:inline">{active}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-3 py-2.5">
          <p className="text-[13px] font-semibold">Theme Morph</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Every live preview on the site re-renders in these tokens. Browse the
            market as if it were already your app.
          </p>
        </div>

        <div className="p-1.5">
          {morphPresets.map((p) => {
            const isActive = !custom && p.id === presetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xs px-2 py-2 text-left transition-colors hover:bg-surface-2",
                  isActive && "bg-surface-2"
                )}
              >
                <Swatches preset={p} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{p.name}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {p.blurb}
                  </span>
                </span>
                {isActive ? <Icon name="check" className="size-4 shrink-0 text-accent" /> : null}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border p-3">
          <label
            htmlFor="morph-css"
            className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-subtle-foreground"
          >
            Paste your tokens
          </label>
          <Textarea
            id="morph-css"
            value={css}
            onChange={(e) => setCss(e.target.value)}
            spellCheck={false}
            placeholder={":root {\n  --background: #fff;\n  --primary: #6244f5;\n  --radius: 0.5rem;\n}"}
            className="h-24 resize-none font-mono text-[11px] leading-relaxed"
          />
          <div className="mt-2 flex items-center gap-2">
            <Button
              size="sm"
              variant="primary"
              className="flex-1"
              onClick={() => {
                const res = applyCss(css);
                if (!res.ok) {
                  toast.error("No recognised tokens found", {
                    description:
                      "Paste a :root block using --background, --primary, --border, --radius and friends.",
                  });
                  return;
                }
                toast.success(`Morphed with ${res.found} tokens`);
                setOpen(false);
              }}
            >
              Apply
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Reset to Vitrine tokens"
              onClick={() => {
                setCss("");
                reset();
              }}
            >
              <Icon name="reset" />
            </Button>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-subtle-foreground">
            Works with a shadcn/ui <code className="font-mono">globals.css</code> pasted
            straight in — HSL triples included.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
