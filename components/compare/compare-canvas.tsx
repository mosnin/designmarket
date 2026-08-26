"use client";

import { Icon } from "@/components/icon";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ShipScoreChip } from "@/components/ship-score-chip";
import { Badge } from "@/components/ui/badge";
import { MorphControl } from "@/components/theme-morph/morph-control";
import { brandInk, brandWash } from "@/lib/brand-color";
import { canRender } from "@/lib/registry-manifest";
import { componentKindLabel } from "@/lib/taxonomy";
import type { ComponentProp, Listing, UIComponent } from "@/lib/types";
import { cn, compactNumber, formatBytes } from "@/lib/utils";

const InlinePreview = dynamic(
  () => import("@/components/preview/inline-preview").then((m) => m.InlinePreview),
  { ssr: false }
);

export type ComparePair = { component: UIComponent; listing: Listing | null };

/**
 * THE COMPARE CANVAS
 *
 * Two things make this different from opening four tabs.
 *
 * First, one set of props drives every column. Props with the same name across
 * different libraries are wired together, so flipping `variant` to `outline`
 * flips it everywhere at once and you are comparing the same state rather than
 * whatever each library happened to default to.
 *
 * Second, the facts row marks which values actually differ. Four identical
 * licences are noise; the one that is GPL is the decision.
 */
export function CompareCanvas({ pairs }: { pairs: ComparePair[] }): ReactNode {
  const sharedProps = useMemo(() => collectSharedProps(pairs), [pairs]);
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const out: Record<string, unknown> = {};
    for (const prop of sharedProps) {
      if (prop.defaultValue !== undefined) out[prop.name] = prop.defaultValue;
      else if (prop.type === "boolean") out[prop.name] = false;
      else if (prop.type === "enum") out[prop.name] = prop.options?.[0];
    }
    return out;
  });

  const rows = useMemo(() => factRows(pairs), [pairs]);

  return (
    <div className="flex flex-col gap-5">
      {sharedProps.length ? (
        <section className="rounded-md border border-border bg-muted/50 p-3">
          <div className="mb-2.5 flex items-center gap-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
              Shared props
            </h2>
            <p className="text-[11px] text-foreground/50">
              wired across every column, so you compare the same state
            </p>
            <MorphControl className="ml-auto" />
          </div>
          <div className="flex flex-wrap gap-2">
            {sharedProps.map((prop) => (
              <SharedPropControl
                key={prop.name}
                prop={prop}
                value={values[prop.name]}
                onChange={(next) =>
                  setValues((current) => ({ ...current, [prop.name]: next }))
                }
                appliesTo={
                  pairs.filter((p) =>
                    p.component.props.some((x) => x.name === prop.name)
                  ).length
                }
                total={pairs.length}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div
        className="grid gap-3.5"
        style={{
          gridTemplateColumns: `repeat(${Math.min(pairs.length, 4)}, minmax(0, 1fr))`,
        }}
      >
        {pairs.map(({ component, listing }) => (
          <article
            key={component.slug}
            className="flex flex-col overflow-hidden rounded-md border border-border bg-muted/50 "
          >
            <header className="flex items-start gap-2 border-b border-border p-3">
              <span
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[4px] font-mono text-[9px] font-semibold"
                style={{
                  backgroundColor: brandWash(listing?.color ?? "var(--accent)", 20),
                  color: brandInk(listing?.color ?? "var(--accent)"),
                }}
              >
                {listing?.monogram ?? "??"}
              </span>
              <span className="min-w-0 flex-1">
                <Link
                  href={`/components/${component.slug}`}
                  className="block truncate text-[14px] font-semibold hover:text-foreground"
                >
                  {component.name}
                </Link>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {listing?.name ?? component.listingSlug}
                </span>
              </span>
              {listing ? <ShipScoreChip listing={listing} /> : null}
            </header>

            <div className="flex min-h-56 flex-1 items-center justify-center bg-grid">
              {canRender(component) && component.registryKey ? (
                <InlinePreview
                  registryKey={component.registryKey}
                  props={values}
                  fitHeight={240}
                  interactive
                  className="size-full"
                />
              ) : (
                <p className="px-4 text-center text-[12px] text-foreground/50">
                  Not vendored into the sandbox yet
                </p>
              )}
            </div>

            <footer className="flex items-center gap-2 border-t border-border px-3 py-2">
              {canRender(component) ? null : <Badge variant="outline">Links out</Badge>}
              <Link
                href={`/compare?remove=${component.slug}`}
                aria-label={`Remove ${component.name} from the comparison`}
                className="ml-auto text-foreground/50 transition-colors hover:text-danger"
              >
                <Icon name="close" className="size-3.5" />
              </Link>
            </footer>
          </article>
        ))}
      </div>

      {/* ------------------------------------------------------------ facts */}
      <section className="overflow-hidden rounded-md border border-border bg-muted/50">
        <h2 className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wider text-foreground/40">
          The facts
        </h2>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[36rem] text-left text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="w-40 px-3 py-2 font-medium text-muted-foreground">
                  &nbsp;
                </th>
                {pairs.map(({ component }) => (
                  <th
                    key={component.slug}
                    scope="col"
                    className="px-3 py-2 font-medium"
                  >
                    {component.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.label}
                  className={cn(
                    "border-b border-border last:border-0",
                    row.differs && "bg-accent-muted/40"
                  )}
                >
                  <th
                    scope="row"
                    className="px-3 py-2 text-left font-normal text-muted-foreground"
                  >
                    <span className="flex items-center gap-1.5">
                      {row.label}
                      {row.differs ? (
                        <span
                          className="size-1.5 rounded-full bg-accent"
                          title="These differ"
                        />
                      ) : null}
                    </span>
                  </th>
                  {row.values.map((value, index) => (
                    <td
                      key={index}
                      className={cn(
                        "px-3 py-2 font-mono text-[12px]",
                        row.differs ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {value === true ? (
                        <Icon name="check" className="size-3.5 text-success" />
                      ) : value === false ? (
                        <Icon name="minus" className="size-3.5 text-foreground/50" />
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-border px-3 py-2 text-[11px] text-foreground/50">
          Highlighted rows are where these actually differ — identical values are
          not a decision.
        </p>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------- helpers */

/**
 * Props with the same name across columns are treated as the same knob. Where
 * two libraries offer different option sets for the same name, the union is
 * offered and each column simply ignores a value it does not know.
 */
function collectSharedProps(pairs: ComparePair[]): ComponentProp[] {
  const byName = new Map<string, ComponentProp>();
  for (const { component } of pairs) {
    for (const prop of component.props) {
      const existing = byName.get(prop.name);
      if (!existing) {
        byName.set(prop.name, { ...prop });
        continue;
      }
      if (existing.type === "enum" && prop.type === "enum") {
        const options = [...new Set([...(existing.options ?? []), ...(prop.options ?? [])])];
        byName.set(prop.name, { ...existing, options });
      }
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

type FactRow = { label: string; values: (string | boolean)[]; differs: boolean };

function factRows(pairs: ComparePair[]): FactRow[] {
  const rows: FactRow[] = [
    {
      label: "Library",
      values: pairs.map((p) => p.listing?.name ?? p.component.listingSlug),
      differs: false,
    },
    {
      label: "Licence",
      values: pairs.map((p) => p.listing?.license ?? "—"),
      differs: false,
    },
    {
      label: "Weekly downloads",
      values: pairs.map((p) =>
        p.listing?.facts.weeklyDownloads
          ? compactNumber(p.listing.facts.weeklyDownloads)
          : "not fetched"
      ),
      differs: false,
    },
    {
      label: "Bundle",
      values: pairs.map((p) =>
        p.listing?.facts.bundleBytes ? formatBytes(p.listing.facts.bundleBytes) : "not fetched"
      ),
      differs: false,
    },
    {
      label: "Runtime deps",
      values: pairs.map((p) =>
        p.listing?.facts.dependencies === undefined
          ? "not fetched"
          : String(p.listing.facts.dependencies)
      ),
      differs: false,
    },
    {
      label: "RSC-safe",
      values: pairs.map((p) => p.listing?.stack.rsc === "safe"),
      differs: false,
    },
    {
      label: "Ships types",
      values: pairs.map((p) => Boolean(p.listing?.stack.typescript)),
      differs: false,
    },
    {
      label: "A11y",
      values: pairs.map((p) => p.listing?.stack.a11y ?? "unknown"),
      differs: false,
    },
    {
      label: "Renders here",
      values: pairs.map((p) => canRender(p.component)),
      differs: false,
    },
    {
      label: "Component kind",
      values: pairs.map((p) => componentKindLabel(p.component.kind)),
      differs: false,
    },
  ];

  for (const row of rows) {
    row.differs = new Set(row.values.map(String)).size > 1;
  }
  return rows;
}

function SharedPropControl({
  prop,
  value,
  onChange,
  appliesTo,
  total,
}: {
  prop: ComponentProp;
  value: unknown;
  onChange: (value: unknown) => void;
  appliesTo: number;
  total: number;
}): ReactNode {
  const partial = appliesTo < total;

  if (prop.type === "boolean") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={Boolean(value)}
        className={cn(
          "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 font-mono text-[11px] transition-colors",
          value
            ? "border-accent bg-accent-muted text-accent"
            : "border-border text-muted-foreground hover:border-foreground/20"
        )}
        title={partial ? `Only ${appliesTo} of ${total} accept this prop` : undefined}
      >
        {prop.name}
        {partial ? <span className="opacity-60">{appliesTo}/{total}</span> : null}
      </button>
    );
  }

  if (prop.type === "enum" && prop.options?.length) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5">
        <span className="pl-1 font-mono text-[11px] text-foreground/50">
          {prop.name}
        </span>
        {prop.options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full px-1.5 py-0.5 font-mono text-[11px] transition-colors",
              value === option
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </span>
    );
  }

  return null;
}
