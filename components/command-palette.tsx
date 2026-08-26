"use client";

import { Command } from "cmdk";
import {
  ArrowRight,
  Boxes,
  CalendarDays,
  Columns3,
  Compass,
  CornerDownLeft,
  LayoutList,
  Loader2,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { SearchHit } from "@/app/api/search/route";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { brandInk, brandWash } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/components", label: "Browse every component", icon: Boxes },
  { href: "/explore", label: "Explore the catalogue", icon: Compass },
  { href: "/stacks", label: "Installable stacks", icon: LayoutList },
  { href: "/compare", label: "Compare components side by side", icon: Columns3 },
  { href: "/drop", label: "Today's Drop", icon: CalendarDays },
  { href: "/submit", label: "Submit a library or tool", icon: Upload },
  { href: "/mcp", label: "Connect your agent (MCP)", icon: Sparkles },
] as const;

const GROUP_LABEL: Record<SearchHit["type"], string> = {
  component: "Components",
  library: "Libraries",
  tool: "AI tools",
  category: "Categories",
};

function Monogram({ hit }: { hit: SearchHit }): ReactNode {
  if (!hit.monogram) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-surface-2 text-subtle-foreground">
        <Search className="size-3" />
      </span>
    );
  }
  return (
    <span
      className="flex size-5 shrink-0 items-center justify-center rounded-[4px] font-mono text-[9px] font-semibold"
      style={{
        backgroundColor: brandWash(hit.color ?? "var(--accent)", 20),
        color: brandInk(hit.color ?? "var(--accent)"),
      }}
    >
      {hit.monogram}
    </span>
  );
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): ReactNode {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // Results are stored alongside the query they answer, so "is this stale?"
  // and "are we loading?" are derived rather than tracked in their own state.
  const [result, setResult] = useState<{ q: string; hits: SearchHit[] }>({
    q: "",
    hits: [],
  });

  const trimmed = query.trim();
  const hits = result.q === trimmed ? result.hits : [];
  const loading = trimmed.length > 0 && result.q !== trimmed;

  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    // Debounced so typing "date picker" is one request, not eleven.
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { hits: SearchHit[] };
        setResult({ q: trimmed, hits: data.hits });
      } catch {
        /* aborted or offline — leave the last answer in place */
      }
    }, 140);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  function go(href: string): void {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  const grouped = (["component", "library", "tool", "category"] as const)
    .map((type) => ({ type, items: hits.filter((h) => h.type === type) }))
    .filter((group) => group.items.length > 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={false}
        className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">Search Vitrine</DialogTitle>
        <Command
          shouldFilter={false}
          loop
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-subtle-foreground"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-3.5">
            {loading ? (
              <Loader2 className="size-4 shrink-0 animate-spin text-subtle-foreground" />
            ) : (
              <Search className="size-4 shrink-0 text-subtle-foreground" />
            )}
            <Command.Input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search components, libraries, tools…"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>

          <Command.List className="max-h-[22rem] overflow-y-auto scrollbar-thin p-1.5">
            {trimmed && !loading && hits.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="text-[13px] text-muted-foreground">
                  Nothing matches “{trimmed}”.
                </p>
                <button
                  type="button"
                  onClick={() => go(`/submit?name=${encodeURIComponent(trimmed)}`)}
                  className="mt-2 text-[13px] font-medium text-accent hover:underline"
                >
                  Submit it to the catalogue
                </button>
              </div>
            ) : null}

            {grouped.map((group) => (
              <Command.Group key={group.type} heading={GROUP_LABEL[group.type]}>
                {group.items.map((hit) => (
                  <Command.Item
                    key={`${hit.type}:${hit.slug}`}
                    value={`${hit.type}:${hit.slug}`}
                    onSelect={() => go(hit.href)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px]",
                      "data-[selected=true]:bg-surface-2"
                    )}
                  >
                    <Monogram hit={hit} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium">{hit.title}</span>
                        {hit.live ? (
                          <span className="live-dot size-1.5 shrink-0 rounded-full bg-live" />
                        ) : null}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {hit.subtitle}
                      </span>
                    </span>
                    {hit.meta ? (
                      <span className="shrink-0 font-mono text-[10px] text-subtle-foreground">
                        {hit.meta}
                      </span>
                    ) : null}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}

            {!trimmed ? (
              <Command.Group heading="Jump to">
                {QUICK_LINKS.map((link) => (
                  <Command.Item
                    key={link.href}
                    value={link.href}
                    onSelect={() => go(link.href)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-surface-2"
                  >
                    <link.icon className="size-4 shrink-0 text-subtle-foreground" />
                    <span className="flex-1">{link.label}</span>
                    <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground" />
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
          </Command.List>

          <div className="flex items-center gap-3 border-t border-border bg-surface-2 px-3 py-2 text-[11px] text-subtle-foreground">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>
                <CornerDownLeft className="size-2.5" />
              </Kbd>{" "}
              open
            </span>
            <span className="ml-auto">Search is open to everyone, logged out included</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
