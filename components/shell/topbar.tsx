"use client";

import { Bookmark, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { AccountMenu } from "@/components/shell/account-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { MorphControl } from "@/components/theme-morph/morph-control";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { topTabs } from "./nav-config";

export function Topbar({
  onOpenSidebar,
  onOpenSearch,
}: {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
}): ReactNode {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 flex h-[var(--header-h)] items-center gap-2 border-b border-border glass px-3 sm:px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
      >
        <Menu />
      </Button>

      <Link href="/" className="lg:hidden" aria-label="Vitrine home">
        <Wordmark />
      </Link>

      <nav aria-label="Sections" className="hidden items-center gap-0.5 lg:flex">
        {topTabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative rounded-sm px-3 py-1.5 text-[13px] font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {active ? (
                <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-accent" />
              ) : null}
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
          <Search />
        </Button>

        <MorphControl />

        <Button variant="ghost" size="icon-sm" asChild aria-label="Bookmarks">
          <Link href="/me/bookmarks">
            <Bookmark />
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
