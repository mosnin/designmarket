import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AUTH_ENABLED, getViewer } from "@/lib/auth-server";

const TABS = [
  { href: "/me/bookmarks", label: "Bookmarks" },
  { href: "/me/boards", label: "Boards" },
  { href: "/me/remixes", label: "Remixes" },
  { href: "/me/submissions", label: "Submissions" },
  { href: "/me/settings", label: "Settings" },
] as const;

export default async function MeLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const viewer = await getViewer();

  if (!AUTH_ENABLED) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-serif text-2xl font-medium">
          Accounts aren&apos;t available on this deployment
        </h1>
        <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Browsing, searching and rendering components all work without a
          backend. Saving things needs one — run{" "}
          <code className="rounded-xs bg-muted px-1 py-0.5 font-mono text-xs">
            npx convex dev
          </code>
          .
        </p>
        <Button variant="outline" size="sm" className="mt-5" asChild>
          <Link href="/explore">Keep browsing</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <header className="border-b border-border pb-4">
        <h1 className="font-serif text-3xl font-medium">
          {viewer?.displayName ?? "Your account"}
        </h1>
        {viewer ? (
          <p className="mt-1 text-[13px] text-muted-foreground">
            @{viewer.handle} · {viewer.plan === "pro" ? "Pro" : "Free"} plan
          </p>
        ) : null}
        <nav aria-label="Account" className="mt-4 flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="rounded-sm px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
