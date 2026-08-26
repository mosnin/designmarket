"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { Hint } from "@/components/ui/tooltip";
import { railGroups, sectionForPath } from "@/lib/section-nav";
import { cn } from "@/lib/utils";

/**
 * THE MASTER RAIL
 *
 * One fixed, never-scrolling list of the markets this catalogue covers. It is
 * the only navigation that is always the same — everything to its right is
 * rebuilt for whichever section is selected, which is what lets the catalogue
 * grow without the navigation growing with it.
 */
export function Rail({ onNavigate }: { onNavigate?: () => void }): ReactNode {
  const pathname = usePathname();
  const active = sectionForPath(pathname);

  return (
    <nav
      aria-label="Sections"
      className="flex h-full flex-col items-center gap-1 overflow-y-auto scrollbar-none py-2"
      onClick={onNavigate}
    >
      {railGroups.map((group, index) => (
        <div key={group.id} className="flex w-full flex-col items-center gap-1">
          {index > 0 ? <span className="my-1 h-px w-8 bg-border" /> : null}
          {group.items.map((section) => {
            const isActive = section.id === active.id;
            return (
              <Hint key={section.id} label={section.blurb} side="right">
                <Link
                  href={section.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex w-16 flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors",
                    isActive
                      ? "bg-accent-muted text-accent"
                      : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
                  )}
                >
                  {isActive ? (
                    <span className="absolute -left-2 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-accent" />
                  ) : null}
                  <span className="relative">
                    <CategoryIcon name={section.icon} className="size-5" />
                    {section.live ? (
                      <span className="live-dot absolute -right-1 -top-0.5 size-1.5 rounded-full bg-live" />
                    ) : null}
                  </span>
                  <span className="text-center text-[10px] font-medium leading-tight">
                    {section.short}
                  </span>
                </Link>
              </Hint>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
