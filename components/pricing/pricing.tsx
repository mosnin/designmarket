"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { FAQ } from "@/components/theme/faq";
import { SectionTitle } from "@/components/theme/section-title";
import { PRO_PRICE_USD, freeFeatures, proFeatures } from "@/lib/config";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The theme's pricing section, with our two plans in it.
 *
 * Card shell, weights, radii, motion and the featured-card shadow step are all
 * the theme's: `rounded-md border bg-background`, `p-6 sm:p-8`, a `-4px` lift
 * on hover, and `shadow-xl` on the plan being pushed against `shadow-sm` on
 * the other. Colour never marks the recommended plan — the shadow does.
 *
 * The free column is not a trap. Everything that makes this index worth
 * reading is in it, and the paid column buys machine access, which is the
 * thing that actually costs us to serve.
 */
export function Pricing(): ReactNode {
  const { isPro, isAuthenticated } = useSession();

  const plans = [
    {
      name: "Free",
      tagline: "No account needed to read it",
      price: "$0",
      priceNote: "forever",
      description:
        "Everything a person needs. Browse, search, render every component live and copy the install commands — logged out. An account adds saving and submitting; reading needs neither.",
      features: freeFeatures,
      cta: { label: "Start browsing", href: "/explore" },
      preferredBy: ["Designers", "Engineers", "Anyone evaluating"],
      featured: false,
    },
    {
      name: "Pro",
      tagline: "For when the thing searching isn't you",
      price: `$${PRO_PRICE_USD}`,
      priceNote: "per month",
      description:
        "An MCP server your coding agent connects to, API keys, and a compatibility endpoint you can call from CI. The catalogue stays free — this covers an agent querying it a thousand times a day.",
      features: proFeatures,
      cta: isPro
        ? { label: "Manage your keys", href: "/me/settings" }
        : {
            label: isAuthenticated ? "Upgrade" : "Create an account",
            href: isAuthenticated ? "/me/settings" : "/signup?next=/pricing",
          },
      preferredBy: ["Claude Code", "Cursor", "CI pipelines"],
      featured: true,
    },
  ];

  return (
    <>
      <section className="relative w-full bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <div className="mb-16 flex flex-col items-center text-center">
            <p className="mb-5 text-xs font-medium uppercase tracking-wider text-foreground/40">
              Pricing
            </p>
            <h1 className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Free to read.
              <br />
              <span className="italic">Paid to automate.</span>
            </h1>
            <p className="mt-5 max-w-xl leading-relaxed text-foreground/60">
              No sign-in wall, no rate-limited search, no components hidden
              behind an account. The paid plan exists because an agent querying
              this index a thousand times a day costs something to serve, and a
              person reading it doesn&apos;t.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease }}
                className={cn(
                  "relative flex flex-col rounded-md border border-border bg-background p-6 transition-shadow sm:p-8",
                  // The theme marks the recommended plan with a shadow step.
                  // That is a light-mode device — a shadow is invisible on a
                  // near-black ground, and both cards read identically there.
                  // Dark falls back to the same idea in the theme's other
                  // register: the foreground, at a higher alpha, on the edge.
                  plan.featured
                    ? "shadow-xl hover:shadow-2xl dark:border-foreground/25 dark:shadow-none"
                    : "shadow-sm hover:shadow-lg dark:shadow-none"
                )}
              >
                <div className="mb-6">
                  <h2 className="font-serif text-lg font-medium text-foreground">
                    {plan.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                </div>

                <div className="mb-6 flex items-baseline gap-2">
                  <p className="text-3xl font-semibold text-foreground sm:text-4xl">
                    {plan.price}
                  </p>
                  <span className="text-sm text-muted-foreground">{plan.priceNote}</span>
                </div>

                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
                  {plan.description}
                </p>

                <ul className="mb-8 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed">
                      <Icon
                        name="check"
                        size={15}
                        className="mt-0.5 shrink-0 text-foreground/40"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.cta.href}
                  className={cn(
                    "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.97]",
                    plan.featured
                      ? "bg-foreground text-background hover:bg-foreground/90"
                      : "border border-border bg-transparent text-foreground hover:bg-muted"
                  )}
                >
                  {plan.cta.label}
                  <Icon
                    name="forward"
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>

                <div className="mt-8 border-t border-border pt-6">
                  <p className="mb-2 text-xs text-muted-foreground">Built for:</p>
                  <div className="flex flex-wrap items-center gap-4">
                    {plan.preferredBy.map((who) => (
                      <span key={who} className="text-xs font-medium text-foreground/70">
                        {who}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- what the tools are */}
      <section className="w-full bg-muted py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <SectionTitle
            eyebrow="The MCP server"
            lead="Five tools, shaped around the question an agent has — which is never “what is popular” but “what can I install into this project without breaking it”."
          >
            What your agent
            <br />
            <span className="italic">actually gets.</span>
          </SectionTitle>

          <dl className="mt-12 border-t border-foreground/10">
            {TOOLS.map(([name, description]) => (
              <div key={name} className="border-b border-foreground/10 py-5">
                <dt className="font-mono text-sm text-foreground">{name}</dt>
                <dd className="mt-1.5 max-w-2xl text-sm leading-relaxed text-foreground/60">
                  {description}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            href="/mcp-connect"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground"
          >
            How to connect it
            <Icon
              name="forward"
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </section>

      <section className="w-full bg-background py-24 sm:py-32">
        <div className="mx-auto max-w-270 px-8 sm:px-12">
          <SectionTitle eyebrow="Questions">
            Before you
            <br />
            <span className="italic">pay anything.</span>
          </SectionTitle>
          <div className="mt-10">
            <FAQ items={QUESTIONS} />
          </div>
        </div>
      </section>
    </>
  );
}

const TOOLS: [string, string][] = [
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
];

const QUESTIONS = [
  {
    question: "Is anything in the catalogue behind the paywall?",
    answer:
      "No. Every listing, every component, every live preview and every install command is free and works logged out. The paid plan adds machine access, not content.",
  },
  {
    question: "What happens to my keys if I cancel?",
    answer:
      "They stop working on the next call. The plan is re-checked on every request rather than trusted from when the key was made, so a key never outlives the subscription that justified it. The keys stay listed so you can see what they did.",
  },
  {
    question: "Can I try the MCP server first?",
    answer:
      "The tool list and what each one returns is documented in full on the connect page, and the same data is on every listing page — so you can see exactly what an agent would get back before paying for the endpoint.",
  },
  {
    question: "Do you resell or train on what my agent queries?",
    answer:
      "No. Usage is counted per key so you can spot a leaked one; the queries themselves are not stored, sold or used to train anything.",
  },
];
