import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { AdminNav } from "@/components/admin/admin-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { AUTH_ENABLED, getViewer, isStaff } from "@/lib/auth-server";
import { siteConfig } from "@/lib/config";

/**
 * The admin surface is not part of the catalogue.
 *
 * It used to render inside the browsing shell, which put a rail of Markets,
 * Stacks and The Drop beside a moderation queue — navigation for shopping,
 * next to a tool for deciding what gets shopped. Different job, different
 * chrome: one bar, the three things an operator does, and a way back out.
 *
 * Anyone who isn't staff gets a 404 rather than a 403. A permission page
 * confirms an admin area exists at this path, which is a small gift to
 * whoever is probing for one.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  if (!AUTH_ENABLED) notFound();
  const viewer = await getViewer();
  if (!isStaff(viewer)) notFound();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[86rem] items-center gap-6 px-5 sm:px-8">
          <span className="flex shrink-0 items-center gap-2">
            <span className="size-5 rounded-full bg-foreground" />
            <span className="text-[15px] font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <span className="ml-1 rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-foreground/60">
              Admin
            </span>
          </span>

          <AdminNav />

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-[12px] text-foreground/50 sm:inline">
              @{viewer?.handle} ·{" "}
              {viewer?.role === "admin" ? "Administrator" : "Moderator"}
            </span>
            <ThemeToggle />
            {/* The way back to the thing being administered. */}
            <Link
              href="/explore"
              className="group inline-flex items-center gap-1.5 text-[13px] text-foreground/70 transition-colors hover:text-foreground"
            >
              Back to the index
              <Icon
                name="forward"
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-[86rem] flex-1 px-5 py-8 sm:px-8">
        {children}
      </main>
    </div>
  );
}
