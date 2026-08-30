"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/admin", label: "Queue" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/members", label: "Members" },
] as const;

/** Underlined tabs, the way the rest of the app marks a current view. */
export function AdminNav(): ReactNode {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex items-center gap-1">
      {TABS.map((tab) => {
        const active =
          tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 px-3 py-[1.125rem] text-[13px] transition-colors",
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-foreground/60 hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
