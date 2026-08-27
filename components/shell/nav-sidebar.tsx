"use client";

import { Icon } from "@/components/icon";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, type ReactNode } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Kbd } from "@/components/ui/kbd";
import { sectionForPath } from "@/lib/section-nav";
import {
  categoriesForSection,
  sections,
  type Section,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * ONE MENU, TWO LEVELS.
 *
 * The sidebar is a single column that replaces its own contents rather than a
 * rail plus a panel. You are either looking at the list of markets or at one
 * market's categories — never at two navigation systems competing for the same
 * glance.
 *
 * Which level shows is derived from the URL, so a link into a category opens
 * with that section's menu already in place and the browser's back button
 * behaves. The one piece of state is the deliberate "go back up" tap, and it
 * is remembered against the route it happened on, so navigating anywhere
 * afterwards drops it.
 */
const ROOT_SECTIONS = sections.filter((s) => s.id !== "explore");

export function NavSidebar({
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

  const [up, setUp] = useState<{ open: boolean; at: string }>({
    open: false,
    at: pathname,
  });
  const showRoot =
    section.id === "explore" || (up.open && up.at === pathname);

  const goUp = useCallback(
    () => setUp({ open: true, at: pathname }),
    [pathname]
  );

  return (
    <div className="flex h-full flex-col" onClick={onNavigate}>
      <div className="shrink-0 p-2">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center gap-2.5 rounded-sm border border-border bg-muted/50 px-2.5 py-2 text-[13px] text-foreground/50 transition-colors hover:border-foreground/20 hover:text-foreground"
        >
          <Icon name="search" className="size-4" />
          <span>Search everything</span>
          <span className="ml-auto flex items-center gap-0.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin pb-8">
        {showRoot ? (
          <div key="root" className="t-level" data-direction="up">
            <RootMenu pathname={pathname} />
          </div>
        ) : (
          <div key={section.id} className="t-level" data-direction="down">
          <SectionMenu
            section={section}
            pathname={pathname}
            onBack={goUp}
            {...(counts ? { counts } : {})}
          />
          </div>
        )}
      </div>

      {/* Pinned, the way the reference pins its submit action: the one thing
          you might want from any screen shouldn't scroll away with the
          categories. */}
      <div className="shrink-0 border-t border-border p-2">
        <Link
          href="/submit"
          className="t-press flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon name="submit" className="size-4 shrink-0 text-foreground/50" />
          Submit a listing
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- level one */

function RootMenu({ pathname }: { pathname: string }): ReactNode {
  return (
    <nav aria-label="Sections" >
      <ul className="px-2">
        <li>
          <NavRow
            href="/explore"
            icon="Compass"
            label="Explore everything"
            active={pathname === "/explore" || pathname === "/"}
          />
        </li>
      </ul>

      <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wider text-foreground/40">
        Markets
      </p>
      <ul className="px-2">
        {ROOT_SECTIONS.filter((s) => s.hasCategories).map((s) => (
          <li key={s.id}>
            <NavRow
              href={s.href}
              icon={s.icon}
              label={s.label}
              live={s.live}
              chevron
              active={false}
            />
          </li>
        ))}
      </ul>

      <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wider text-foreground/40">
        Tools
      </p>
      <ul className="px-2">
        {ROOT_SECTIONS.filter((s) => !s.hasCategories).map((s) => (
          <li key={s.id}>
            <NavRow
              href={s.href}
              icon={s.icon}
              label={s.label}
              active={pathname.startsWith(s.href)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------- level two */

function SectionMenu({
  section,
  pathname,
  counts,
  onBack,
}: {
  section: Section;
  pathname: string;
  counts?: Record<string, number>;
  onBack: () => void;
}): ReactNode {
  const groups = categoriesForSection(section.id);

  return (
    <nav aria-label={section.label}>
      <div className="px-2 pt-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onBack();
          }}
          className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Icon name="back" className="size-3.5" />
          All markets
        </button>
      </div>

      <div className="px-4 pb-2 pt-2">
        <p className="text-[14px] font-semibold tracking-tight">
          {section.label}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {section.blurb}
        </p>
      </div>

      <ul className="px-2">
        <li>
          <NavRow
            href={section.href}
            label={section.allLabel ?? `All ${section.label}`}
            active={pathname === section.href}
          />
        </li>
        {section.id === "ui" ? (
          <li>
            <NavRow
              href="/components"
              label="All components"
              live
              active={pathname === "/components"}
            />
          </li>
        ) : null}
      </ul>

      {groups.map((entry) => (
        <div key={entry.group.id}>
          <p className="px-4 pb-1 pt-4 text-xs font-medium uppercase tracking-wider text-foreground/40">
            {entry.group.name}
          </p>
          <ul className="px-2">
            {entry.items.map((category) => {
              const href = `/c/${category.slug}`;
              return (
                <li key={category.slug}>
                  <NavRow
                    href={href}
                    label={category.name}
                    active={pathname === href}
                    {...(counts?.[category.slug]
                      ? { count: counts[category.slug] }
                      : {})}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ row */

function NavRow({
  href,
  icon,
  label,
  active,
  count,
  chevron,
  live,
}: {
  href: string;
  icon?: string;
  label: string;
  active: boolean;
  count?: number;
  chevron?: boolean;
  live?: boolean;
}): ReactNode {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "t-press group relative flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-[13px]",
        active
          ? "bg-foreground/5 font-medium text-foreground"
          : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
      )}
    >
      {icon ? (
        <CategoryIcon
          name={icon}
          className={cn(
            "size-4 shrink-0",
            active ? "text-foreground" : "text-foreground/40 group-hover:text-foreground"
          )}
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {live ? (
        <span className="live-dot size-1.5 shrink-0 rounded-full bg-live" />
      ) : null}
      {count !== undefined ? (
        <span className="shrink-0 font-mono text-[11px] tabular-nums text-foreground/50">
          {count}
        </span>
      ) : null}
      {chevron ? (
        <Icon name="forward" className="size-3.5 shrink-0 text-foreground/50 transition-transform group-hover:translate-x-0.5" />
      ) : null}
    </Link>
  );
}
