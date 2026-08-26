import Link from "next/link";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/logo";
import { LiveBadge } from "@/components/ui/badge";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" aria-label="Vitrine home" className="w-fit">
          <Wordmark />
        </Link>
        <main
          id="main"
          className="flex flex-1 items-center justify-center py-10"
        >
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>

      {/* The value proposition, restated where the decision is being made. */}
      <aside className="relative hidden overflow-hidden border-l border-border bg-muted bg-grid lg:block">
        <div className="flex h-full flex-col justify-center px-12">
          <LiveBadge />
          <h1 className="mt-5 max-w-md font-serif text-3xl font-medium leading-tight">
            Every component on this site is really running.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            Not a screenshot, not a video. Resize it, change its props, and paint
            it in your own design tokens before you decide whether to install it.
          </p>
          <ul className="mt-8 flex max-w-md flex-col gap-3 text-[13px] text-muted-foreground">
            {[
              "Bookmark anything, and organise it into boards",
              "Remix a component's props and save the variant",
              "Submit your own library, components or tool",
              "Turn a board into an installable stack",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-md text-xs leading-relaxed text-foreground/50">
            Browsing never needs an account. Accounts are for keeping things.
          </p>
        </div>
      </aside>
    </div>
  );
}
