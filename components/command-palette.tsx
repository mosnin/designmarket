"use client";

import { Icon, type IconName } from "@/components/icon";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { SearchHit } from "@/app/api/search/route";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { brandInk, brandWash } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

const QUICK_LINKS = [
  { href: "/components", label: "Browse every component", icon: "ui" },
  { href: "/explore", label: "Explore the catalogue", icon: "explore" },
  { href: "/stacks", label: "Installable stacks", icon: "stacks" },
  { href: "/compare", label: "Compare components side by side", icon: "compare" },
  { href: "/drop", label: "Today's Drop", icon: "drop" },
  { href: "/submit", label: "Submit a library or tool", icon: "submit" },
  { href: "/mcp", label: "Connect your agent (MCP)", icon: "mcp" },
] as const satisfies readonly { href: string; label: string; icon: IconName }[];

const GROUP_LABEL: Record<SearchHit["type"], string> = {
  component: "Components",
  library: "Libraries",
  tool: "AI tools",
  category: "Categories",
};

function Monogram({ hit }: { hit: SearchHit }): ReactNode {
  if (!hit.monogram) {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-[4px] bg-muted text-foreground/50">
        <Icon name="search" className="size-3" />
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
          className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-foreground/50"
        >
          <div className="flex items-center gap-2.5 border-b border-border px-3.5">
            {loading ? (
              <Icon name="loading" className="size-4 shrink-0 animate-spin text-foreground/50" />
            ) : (
              <Icon name="search" className="size-4 shrink-0 text-foreground/50" />
            )}
            <Command.Input
              value={query}
              onValueChange={setQuery}
              autoFocus
              placeholder="Search components, libraries, tools…"
              className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/50"
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
                      "data-[selected=true]:bg-muted"
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
                      <span className="shrink-0 font-mono text-[10px] text-foreground/50">
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
                    className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] data-[selected=true]:bg-muted"
                  >
                    <Icon name={link.icon} className="text-foreground/50" />
                    <span className="flex-1">{link.label}</span>
                    <Icon name="forward" className="size-3.5 shrink-0 text-foreground/50" />
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
          </Command.List>

          <div className="flex items-center gap-3 border-t border-border bg-muted px-3 py-2 text-[11px] text-foreground/50">
            <span className="flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>
                <Icon name="check" className="size-2.5" />
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
