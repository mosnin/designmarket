import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
