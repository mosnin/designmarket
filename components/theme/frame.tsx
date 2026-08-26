import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * THE THEME'S SPINE
 *
 * The purchased theme runs a pair of hairlines down a `max-w-270` column and
 * marks the corners with 6px squares. The rules extend off-screen with
 * `w-screen`/`h-screen` so the frame reads as a drafting grid the page is set
 * on rather than as a box drawn around it.
 *
 * It appears in the hero, the footer and the CTA there. It was in exactly one
 * component here, which is most of why the rest of this app stopped looking
 * like the theme. Now it is a primitive, and every marketing section sits in
 * one.
 */
export function Frame({
  children,
  edge,
  className,
}: {
  children: ReactNode;
  /** which horizontal rule to draw, with the corner ticks that go on it */
  edge?: "top" | "bottom" | "both" | "none";
  className?: string;
}): ReactNode {
  const top = edge === "top" || edge === "both";
  const bottom = edge === "bottom" || edge === "both";

  return (
    <div className={cn("relative flex justify-center px-6 sm:px-8", className)}>
      <div className="relative w-full max-w-270">
        {/* The verticals, running past the section in both directions. */}
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-foreground/10" />
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-px bg-foreground/10" />

        {top ? <Rule position="top" /> : null}
        {bottom ? <Rule position="bottom" /> : null}

        <div className="relative px-8 sm:px-12">{children}</div>
      </div>
    </div>
  );
}

/** A horizontal rule that runs to both screen edges, ticked at the column. */
function Rule({ position }: { position: "top" | "bottom" }): ReactNode {
  const y = position === "top" ? "top-0" : "bottom-0";
  const tick = position === "top" ? "-top-0.75" : "-bottom-0.75";
  return (
    <span aria-hidden className="pointer-events-none">
      <span className={cn("absolute inset-x-0 h-px bg-foreground/10", y)} />
      <span className={cn("absolute right-full h-px w-screen bg-foreground/10", y)} />
      <span className={cn("absolute left-full h-px w-screen bg-foreground/10", y)} />
      <span className={cn("absolute -left-0.75 size-1.5 bg-foreground", tick)} />
      <span className={cn("absolute -right-0.75 size-1.5 bg-foreground", tick)} />
    </span>
  );
}

/**
 * The theme sets every section heading in the serif, at one of three sizes,
 * and italicises the clause it wants to land on. Centralised so a heading can
 * never drift into a different voice.
 */
export function SectionTitle({
  children,
  eyebrow,
  lead,
  align = "left",
  className,
}: {
  children: ReactNode;
  eyebrow?: string;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
}): ReactNode {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "max-w-2xl",
        className
      )}
    >
      {eyebrow ? (
        <p className="mb-5 text-xs font-medium uppercase tracking-wider text-foreground/40">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
        {children}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-xl leading-relaxed text-foreground/60">{lead}</p>
      ) : null}
    </div>
  );
}
