"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

const links = [
  { label: "UI & Design", href: "/ui" },
  { label: "Tools", href: "/tools" },
  { label: "MCP", href: "/mcp" },
  { label: "Stacks", href: "/stacks" },
  { label: "Pricing", href: "/pricing" },
] as const;

/**
 * The marketing header, which is not the app's topbar.
 *
 * The landing page has no sidebar and no section rail — it is a page you read,
 * not an interface you operate. Running the app shell around it was the reason
 * the hero looked like it had been crammed into a dashboard.
 */
export function MarketingHeader(): ReactNode {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-foreground/10 bg-background/80 backdrop-blur-md" : ""
      )}
    >
      <div className="mx-auto flex h-16 max-w-270 items-center gap-6 px-8 sm:px-12">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="size-6 rounded-full bg-foreground" />
          <span className="text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/signin">Log in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/explore">
              Browse the index
              <Icon name="forward" size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <button
            type="button"
            className="md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} size={20} />
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-foreground/10 bg-background px-8 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-foreground/70"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
