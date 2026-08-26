"use client";

import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Kbd } from "@/components/ui/kbd";
import { sectionForPath } from "@/lib/section-nav";
import {
  categoriesForSection,
  type Category,
  type CategoryGroup,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * THE SECTION SIDEBAR
 *
 * Rebuilt from scratch whenever the rail changes section. It only ever renders
 * the categories of the section you are in — around fifteen rows — so the
 * catalogue can hold a hundred thousand listings across ninety-seven
 * categories and this list never gets longer.
 */
export function SectionSidebar({
  counts,
  onNavigate,
  onOpenSearch,
}: {
  counts?: Record<string, number>;
  onNavigate?: () => void;
  onOpenSearch?: () => void;
}): ReactNode {
  const pathname = usePathname();
  const section = sectionForPath(pathname);
  const groups = categoriesForSection(section.id);

  return (
    <div
      className="flex h-full flex-col overflow-y-auto scrollbar-thin"
      onClick={onNavigate}
    >
      <div className="border-b border-border px-3 py-3">
        <h2 className="text-[13px] font-semibold tracking-tight">{section.label}</h2>
        <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
          {section.blurb}
        </p>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center gap-2.5 rounded-sm border border-border bg-surface px-2.5 py-1.5 text-[13px] text-subtle-foreground transition-colors hover:border-border-strong hover:text-foreground"
        >
          <Search className="size-3.5" />
          <span>Search</span>
          <span className="ml-auto flex items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      {section.kinds.length ? (
        <SectionLinks section={section.id} pathname={pathname} />
      ) : null}

      {groups.length ? (
        <div className="flex flex-col pb-8">
          {groups.map((entry, index) => (
            <CategoryGroupSection
              key={entry.group.id}
              group={entry.group}
              items={entry.items}
              defaultOpen={index === 0}
              pathname={pathname}
              {...(counts ? { counts } : {})}
            />
          ))}
        </div>
      ) : (
        <p className="px-4 py-6 text-[12px] leading-relaxed text-subtle-foreground">
          {section.label} has no sub-categories — everything lives on one page.
        </p>
      )}
    </div>
  );
}

/** Section-level entry points that are not categories. */
function SectionLinks({
  section,
  pathname,
}: {
  section: string;
  pathname: string;
}): ReactNode {
  const links =
    section === "ui"
      ? [
          { href: "/components", label: "All components", icon: "Component", live: true },
          { href: "/libraries", label: "All libraries", icon: "Boxes" },
        ]
      : [];

  if (!links.length) return null;

  return (
    <ul className="border-b border-border px-2 pb-2">
      {links.map((link) => {
        const active = pathname === link.href;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className={cn(
                "flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[13px] transition-colors",
                active
                  ? "bg-accent-muted font-medium text-accent"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <CategoryIcon name={link.icon} className="size-4 shrink-0" />
              <span className="truncate">{link.label}</span>
              {link.live ? (
                <span className="live-dot ml-auto size-1.5 rounded-full bg-live" />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function CategoryGroupSection({
  group,
  items,
  counts,
  defaultOpen,
  pathname,
}: {
  group: CategoryGroup;
  items: Category[];
  counts?: Record<string, number>;
  defaultOpen: boolean;
  pathname: string;
}): ReactNode {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="px-2 pt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground transition-colors hover:text-foreground"
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
        <ul>
          {items.map((category) => {
            const href = `/c/${category.slug}`;
            const active = pathname === href;
            const count = counts?.[category.slug];
            return (
              <li key={category.slug}>
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
                    name={category.icon}
                    className={cn(
                      "size-4 shrink-0",
                      active
                        ? "text-accent"
                        : "text-subtle-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{category.name}</span>
                  {count ? (
                    <span className="ml-auto font-mono text-[11px] tabular-nums text-subtle-foreground">
                      {count}
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
