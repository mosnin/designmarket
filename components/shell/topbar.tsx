"use client";

import { Icon } from "@/components/icon";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { AccountMenu } from "@/components/shell/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { MorphControl } from "@/components/theme-morph/morph-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sectionForPath } from "@/lib/section-nav";
import { categoriesForSection } from "@/lib/taxonomy";

export function Topbar({
  onOpenSidebar,
  onOpenSearch,
}: {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
}): ReactNode {
  const pathname = usePathname();
  const section = sectionForPath(pathname);
  const onSectionRoot = pathname === section.href;
  const shortcuts = categoriesForSection(section.id)
    .flatMap((entry) => entry.items)
    .slice(0, 5);

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-h)] items-center gap-2 border-b border-border glass px-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
      >
        <Icon name="menu" />
      </Button>

      <Link href="/" className="lg:hidden" aria-label="Vitrine home">
        <Wordmark />
      </Link>

      {/* Second level: the current section, then its busiest categories, so
          the sideways move is one click even with the sidebar collapsed. */}
      <nav
        aria-label="Section"
        className="hidden min-w-0 items-center gap-1 overflow-x-auto scrollbar-none lg:flex"
      >
        <Link
          href={section.href}
          className={cn(
            // Tabs, underlined — the reference marks the current view with a
            // rule under the label, not with a filled pill floating in the
            // header.
            "shrink-0 border-b-2 px-3 py-[1.125rem] text-[13px] font-medium transition-colors",
            onSectionRoot
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {section.label}
        </Link>
        {shortcuts.length ? (
          <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-border" />
        ) : null}
        {shortcuts.map((category) => {
          const href = `/c/${category.slug}`;
          const active = pathname === href;
          return (
            <Link
              key={category.slug}
              href={href}
              className={cn(
                "shrink-0 border-b-2 px-3 py-[1.125rem] text-[13px] transition-colors",
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Icon name="search" />
        </Button>

        <MorphControl />

        <Button variant="ghost" size="icon-sm" asChild aria-label="Bookmarks">
          <Link href="/me/bookmarks">
            <Icon name="bookmark" />
          </Link>
        </Button>

        <ThemeToggle className="hidden sm:inline-flex" />

        <div className="ml-1">
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
