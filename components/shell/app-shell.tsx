"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { CommandPalette } from "@/components/command-palette";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  counts,
}: {
  children: ReactNode;
  counts?: Record<string, number>;
}): ReactNode {
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  // The drawer is remembered against the route it was opened on, so navigating
  // closes it by derivation rather than by a setState in an effect.
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
        <aside className="sticky top-0 hidden h-dvh w-[var(--sidebar-w)] shrink-0 border-r border-border bg-surface lg:block">
          <div className="flex h-[var(--header-h)] items-center border-b border-border px-4">
            <Link href="/" aria-label="Vitrine home">
              <Wordmark />
            </Link>
          </div>
          <div className="h-[calc(100dvh-var(--header-h))]">
            <Sidebar {...(counts ? { counts } : {})} onOpenSearch={openSearch} />
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
        <DialogContent className="left-0 top-0 h-dvh max-w-[17rem] translate-x-0 translate-y-0 gap-0 rounded-none border-y-0 border-l-0 p-0">
          <DialogTitle className="flex h-[var(--header-h)] items-center border-b border-border px-4">
            <Wordmark />
          </DialogTitle>
          <div className="min-h-0 flex-1 overflow-hidden">
            <Sidebar
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
