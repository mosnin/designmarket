"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { PRO_PRICE_USD, freeFeatures, proFeatures } from "@/lib/config";
import { useSession } from "@/lib/session";

/**
 * Two columns, and the free one is not a trap.
 *
 * Everything that makes this index worth reading — every component rendering
 * live, every Ship Score with its working, every install command — is free and
 * works logged out. What costs $9 is machine access: the MCP server, keys, and
 * the compatibility API. A person browsing pays nothing; an agent doing it a
 * thousand times a day pays for the bandwidth it uses.
 */
export function Pricing(): ReactNode {
  const { isPro, isAuthenticated } = useSession();

  return (
    <div className="mx-auto max-w-[64rem] px-5 py-16 sm:px-8">
      <header className="max-w-2xl">
        <h1 className="font-serif text-[34px] font-medium leading-tight">
          Free to read. Paid to automate.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          The catalogue is free and always will be — no sign-in wall, no
          rate-limited search, no components hidden behind an account. The paid
          plan exists because an agent querying this index a thousand times a
          day costs something to serve, and a person reading it doesn&apos;t.
        </p>
      </header>

      <div className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border md:grid-cols-2">
        <section className="bg-background p-7">
          <h2 className="font-serif text-lg font-medium">Free</h2>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-[32px] font-semibold leading-none">$0</span>
            <span className="text-[13px] text-muted-foreground">forever</span>
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            Everything a human needs. An account adds saving and submitting;
            browsing needs neither.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {freeFeatures.map((feature) => (
              <Row key={feature}>{feature}</Row>
            ))}
          </ul>
          <Button variant="outline" size="md" className="mt-7 w-full rounded-full" asChild>
            <Link href="/explore">Start browsing</Link>
          </Button>
        </section>

        <section className="bg-muted/50 p-7">
          <h2 className="text-[15px] font-semibold text-accent">Pro</h2>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-[32px] font-semibold leading-none">
              ${PRO_PRICE_USD}
            </span>
            <span className="text-[13px] text-muted-foreground">per month</span>
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
            For when the thing doing the searching isn&apos;t you.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {proFeatures.map((feature) => (
              <Row key={feature} accent>
                {feature}
              </Row>
            ))}
          </ul>

          {isPro ? (
            <Button variant="outline" size="md" className="mt-7 w-full rounded-full" asChild>
              <Link href="/me/settings">Manage your keys</Link>
            </Button>
          ) : (
            <Button variant="primary" size="md" className="mt-7 w-full rounded-full" asChild>
              <Link href={isAuthenticated ? "/me/settings" : "/signup?next=/pricing"}>
                {isAuthenticated ? "Upgrade" : "Create an account"}
              </Link>
            </Button>
          )}
        </section>
      </div>

      <section className="mt-16">
        <h2 className="text-[20px] font-semibold tracking-tight">
          What the MCP server actually does
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
          Five tools, shaped around the question an agent has — which is never
          &ldquo;what is popular&rdquo; but &ldquo;what can I install into this
          project without breaking it&rdquo;.
        </p>
        <dl className="mt-6 divide-y divide-foreground/10 border-y border-border">
          {[
            [
              "search_listings",
              "Search by your project's constraints. A library that needs React 19 isn't down-ranked for an 18 project — it's removed, because it's wrong, not less relevant.",
            ],
            [
              "get_listing",
              "The full record, including the Ship Score broken into dimensions with the evidence behind each — so an agent picking between two libraries knows which one is weak where.",
            ],
            [
              "get_component",
              "Usage snippet, install command, import line, props and accessibility notes for one component.",
            ],
            [
              "install_plan",
              "A set of slugs becomes batched commands plus a resolved manifest. Anything not installable from a terminal is named with the reason, never given an invented command.",
            ],
            [
              "check_compatibility",
              "Returns the specific conflicts — which two things disagree and about what — rather than a compatibility percentage nobody can act on.",
            ],
          ].map(([name, description]) => (
            <div key={name} className="py-3.5">
              <dt className="font-mono text-[13px] text-accent">{name}</dt>
              <dd className="mt-1 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                {description}
              </dd>
            </div>
          ))}
        </dl>
        <Link
          href="/mcp-connect"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-accent hover:underline"
        >
          How to connect it
          <Icon name="forward" size={13} />
        </Link>
      </section>
    </div>
  );
}

function Row({
  children,
  accent,
}: {
  children: ReactNode;
  accent?: boolean;
}): ReactNode {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-relaxed">
      <Icon
        name="check"
        size={15}
        className={`mt-0.5 shrink-0 ${accent ? "text-accent" : "text-foreground/50"}`}
      />
      {children}
    </li>
  );
}
