"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import {
  categoriesInGroup,
  categoryGroups,
  type CategoryGroupId,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";
import { primaryNav } from "./nav-config";

function useIsActive(): (href: string) => boolean {
  const pathname = usePathname();
  return (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function FlagDot({ flag }: { flag: NonNullable<string> }): ReactNode {
  if (flag === "live") {
    return <span className="live-dot ml-auto size-1.5 rounded-full bg-live" aria-label="renders live" />;
  }
  if (flag === "pro") {
    return (
      <Badge variant="accent" size="sm" className="ml-auto">
        Pro
      </Badge>
    );
  }
  return null;
}

function GroupSection({
  group,
  counts,
}: {
  group: (typeof categoryGroups)[number];
  counts?: Record<string, number>;
}): ReactNode {
  const [open, setOpen] = useState(group.id === "ui");
  const isActive = useIsActive();
  const items = categoriesInGroup(group.id as CategoryGroupId);

  return (
    <div className="px-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground transition-colors hover:text-foreground"
      >
        {group.name}
        <ChevronDown
          className={cn(
            "ml-auto size-3.5 transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>
      {open ? (
        <ul className="mb-1">
          {items.map((c) => {
            const href = `/c/${c.slug}`;
            const active = isActive(href);
            return (
              <li key={c.slug}>
                <Link
                  href={href}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] transition-colors",
                    active
                      ? "bg-surface-2 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  <CategoryIcon
                    name={c.icon}
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-accent" : "text-subtle-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{c.name}</span>
                  {counts?.[c.slug] ? (
                    <span className="ml-auto font-mono text-[11px] text-subtle-foreground">
                      {counts[c.slug]}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export function Sidebar({
  counts,
  onNavigate,
  onOpenSearch,
}: {
  counts?: Record<string, number>;
  onNavigate?: () => void;
  onOpenSearch?: () => void;
}): ReactNode {
  const isActive = useIsActive();

  return (
    <nav
      aria-label="Primary"
      className="flex h-full flex-col overflow-y-auto scrollbar-thin pb-8"
      onClick={onNavigate}
    >
      <div className="p-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center gap-2.5 rounded-sm border border-border bg-surface px-2.5 py-2 text-[13px] text-subtle-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Search className="size-4" />
          <span>Search</span>
          <span className="ml-auto flex items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <ul className="px-2 pb-2">
        {primaryNav.map((item) => {
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent-muted font-medium text-accent"
                    : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {active ? (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" />
                ) : null}
                <CategoryIcon
                  name={item.icon}
                  className={cn(
                    "size-4 shrink-0",
                    active ? "text-accent" : "text-subtle-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.label}</span>
                {item.flag ? <FlagDot flag={item.flag} /> : null}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mx-4 mb-2 h-px bg-border" />

      <div className="flex flex-col gap-0.5">
        {categoryGroups.map((g) => (
          <GroupSection key={g.id} group={g} {...(counts ? { counts } : {})} />
        ))}
      </div>
    </nav>
  );
}
