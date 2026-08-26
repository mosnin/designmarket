import Link from "next/link";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/config";

const columns = [
  {
    title: "Index",
    links: [
      { label: "UI & Design", href: "/ui" },
      { label: "Tools", href: "/tools" },
      { label: "MCP Servers", href: "/mcp" },
      { label: "Skills", href: "/skills" },
      { label: "APIs", href: "/apis" },
      { label: "Repositories", href: "/repos" },
    ],
  },
  {
    title: "Use it",
    links: [
      { label: "Components", href: "/components" },
      { label: "Stacks", href: "/stacks" },
      { label: "Compare", href: "/compare" },
      { label: "The Drop", href: "/drop" },
    ],
  },
  {
    title: "For agents",
    links: [
      { label: "MCP server", href: "/mcp-connect" },
      { label: "Pricing", href: "/pricing" },
      { label: "Submit a listing", href: "/submit" },
    ],
  },
] as const;

/** The theme's footer: ruled column, corner ticks, three link stacks. */
export function Footer(): ReactNode {
  return (
    <footer className="relative w-full overflow-hidden bg-background text-foreground">
      <div className="flex justify-center border-t border-foreground/10 px-6 sm:px-8 pt-16">
        <div className="relative w-full max-w-270">
          <div className="relative px-8 py-12 sm:px-12">
            <div className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-8">
              <div className="lg:max-w-xs">
                <Link href="/" className="flex items-center gap-2">
                  <span className="size-6 rounded-full bg-foreground" />
                  <span className="text-lg font-semibold">{siteConfig.name}</span>
                </Link>
                <p className="mt-4 max-w-xs text-sm text-foreground/50">
                  {siteConfig.tagline} Every figure on this site was fetched
                  from its source; anything we could not verify is left blank.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
                {columns.map((column) => (
                  <div key={column.title}>
                    <h3 className="mb-5 text-xs font-medium uppercase tracking-wider text-foreground/40">
                      {column.title}
                    </h3>
                    <ul className="space-y-3">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-6 sm:px-8">
        <div className="w-full max-w-270 px-8 py-8 sm:px-12">
          <p className="text-xs text-foreground/40">
            © {new Date().getFullYear()} {siteConfig.name}. A catalogue of other
            people&apos;s work — every listing links back to its source.
          </p>
        </div>
      </div>
    </footer>
  );
}
