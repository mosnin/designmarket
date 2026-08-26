"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { LogoMark, Wordmark } from "@/components/brand/logo";
import { siteConfig } from "@/lib/config";
import { CommandPalette } from "@/components/command-palette";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Rail } from "./rail";
import { SectionSidebar } from "./section-sidebar";
import { Topbar } from "./topbar";

/**
 * THE SHELL
 *
 * Three columns, and the split is the point:
 *
 *   rail      never changes — the markets this catalogue covers
 *   sidebar   rebuilt per section — only that section's categories
 *   content   the section itself
 *
 * The catalogue can grow to any size and the rail stays nine rows, because
 * nothing here ever renders "all categories".
 */
export function AppShell({
  children,
  counts,
}: {
  children: ReactNode;
  counts?: Record<string, number>;
}): ReactNode {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  const [nav, setNav] = useState<{ open: boolean; at: string }>({
    open: false,
    at: pathname,
  });
  const mobileNavOpen = nav.open && nav.at === pathname;
  const setMobileNavOpen = useCallback(
    (open: boolean) => setNav({ open, at: pathname }),
    [pathname]
  );

  const openSearch = useCallback(() => setSearchOpen(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-dvh">
      <div className="flex">
        {/* master rail */}
        <aside className="sticky top-0 hidden h-dvh w-[4.5rem] shrink-0 border-r border-border bg-surface-2 lg:block">
          <div className="flex h-[var(--header-h)] items-center justify-center border-b border-border">
            <Link href="/" aria-label="Vitrine home">
              <LogoMark className="size-6" />
            </Link>
          </div>
          <div className="h-[calc(100dvh-var(--header-h))]">
            <Rail />
          </div>
        </aside>

        {/* section sidebar */}
        <aside className="sticky top-0 hidden h-dvh w-[15rem] shrink-0 border-r border-border bg-surface xl:block">
          <div className="flex h-[var(--header-h)] items-center border-b border-border px-3">
            <Link
              href="/"
              aria-label="Vitrine home"
              className="text-[15px] font-semibold tracking-tight"
            >
              {siteConfig.name}
            </Link>
          </div>
          <div className="h-[calc(100dvh-var(--header-h))]">
            <SectionSidebar
              {...(counts ? { counts } : {})}
              onOpenSearch={openSearch}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <Topbar
            onOpenSidebar={() => setMobileNavOpen(true)}
            onOpenSearch={openSearch}
          />
          <main id="main" className="min-h-[calc(100dvh-var(--header-h))]">
            {children}
          </main>
        </div>
      </div>

      {/* Below xl the two rails collapse into one drawer, side by side. */}
      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="left-0 top-0 flex h-dvh max-w-[20rem] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 p-0">
          <DialogTitle className="flex h-[var(--header-h)] shrink-0 items-center border-b border-border px-4">
            <Wordmark />
          </DialogTitle>
          <div className="flex min-h-0 flex-1">
            <div className="w-[4.5rem] shrink-0 border-r border-border bg-surface-2">
              <Rail onNavigate={() => setMobileNavOpen(false)} />
            </div>
            <div className="min-w-0 flex-1">
              <SectionSidebar
                {...(counts ? { counts } : {})}
                onNavigate={() => setMobileNavOpen(false)}
                onOpenSearch={() => {
                  setMobileNavOpen(false);
                  setSearchOpen(true);
                }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
