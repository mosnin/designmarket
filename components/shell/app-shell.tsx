"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { CommandPalette } from "@/components/command-palette";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { NavSidebar } from "./nav-sidebar";
import { Topbar } from "./topbar";

/**
 * Two columns: one sidebar and the page.
 *
 * The sidebar drills — markets, then one market's categories — rather than
 * splitting into a rail plus a panel. One navigation, one place to look.
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
        <aside className="sticky top-0 hidden h-dvh w-[15.5rem] shrink-0 border-r border-border bg-muted/50 lg:block">
          <div className="flex h-[var(--header-h)] items-center border-b border-border px-4">
            <Link href="/" aria-label="Vitrine home">
              <Wordmark />
            </Link>
          </div>
          <div className="h-[calc(100dvh-var(--header-h))]">
            <NavSidebar
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

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="left-0 top-0 flex h-dvh max-w-[17rem] translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-y-0 border-l-0 p-0">
          <DialogTitle className="flex h-[var(--header-h)] shrink-0 items-center border-b border-border px-4">
            <Wordmark />
          </DialogTitle>
          <div className="min-h-0 flex-1">
            <NavSidebar
              {...(counts ? { counts } : {})}
              onNavigate={() => setMobileNavOpen(false)}
              onOpenSearch={() => {
                setMobileNavOpen(false);
                setSearchOpen(true);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
