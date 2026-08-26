import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AUTH_ENABLED, getViewer, isStaff } from "@/lib/auth-server";

const TABS = [
  { href: "/admin", label: "Queue" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/members", label: "Members" },
] as const;

/**
 * Anyone who isn't staff gets a 404, not a 403.
 *
 * A "you don't have permission" page confirms that an admin area exists at
 * this path, which is a small gift to anyone probing for one. As far as the
 * rest of the world is concerned, /admin is simply not a page.
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
    <div className="mx-auto max-w-[86rem] px-5 py-8 sm:px-8">
      <header className="border-b border-border pb-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-serif text-[26px] font-medium">Admin</h1>
          <p className="text-[13px] text-muted-foreground">
            Signed in as @{viewer?.handle} ·{" "}
            {viewer?.role === "admin" ? "Administrator" : "Moderator"}
          </p>
        </div>
        <nav aria-label="Admin" className="-mb-4 mt-4 flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mt-6">{children}</div>
    </div>
  );
}
