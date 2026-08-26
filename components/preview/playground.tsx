"use client";

import {
  ExternalLink,
  Laptop,
  Link2,
  Monitor,
  RotateCcw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { getRegistryEntry } from "@/components/registry";
import { CodeBlock, CommandLine } from "@/components/preview/code-panel";
import { PreviewFrame } from "@/components/preview/preview-frame";
import { SaveRemix } from "@/components/preview/save-remix";
import { MorphControl } from "@/components/theme-morph/morph-control";
import { Badge, LiveBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { keyToSlug } from "@/lib/registry-manifest";
import type { ComponentProp, UIComponent } from "@/lib/types";
import { cn } from "@/lib/utils";

const VIEWPORTS = [
  { id: "sm", label: "Phone", width: 380, icon: Smartphone },
  { id: "md", label: "Tablet", width: 720, icon: Tablet },
  { id: "lg", label: "Laptop", width: 1024, icon: Laptop },
  { id: "full", label: "Fill", width: 0, icon: Monitor },
] as const;

function defaultProps(props: ComponentProp[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const prop of props) {
    if (prop.defaultValue !== undefined) out[prop.name] = prop.defaultValue;
    else if (prop.type === "boolean") out[prop.name] = false;
    else if (prop.type === "enum") out[prop.name] = prop.options?.[0];
  }
  return out;
}

/**
 * THE PLAYGROUND
 *
 * Everything you would otherwise have to clone a repo to find out: what the
 * component looks like at 380px, what its props actually do, and what it looks
 * like in *your* tokens. The viewport control resizes the frame rather than
 * the browser, so a container query inside the component responds for real.
 */
export function Playground({
  component,
  listingName,
}: {
  component: UIComponent;
  listingName?: string;
}): ReactNode {
  const entry = component.registryKey
    ? getRegistryEntry(component.registryKey)
    : null;

  const searchParams = useSearchParams();
  const initial = useMemo(() => defaultProps(component.props), [component.props]);

  // A shared link or a saved remix arrives as ?p=<encoded json>, so opening
  // one lands on exactly the configuration that was saved.
  const opened = useMemo<Record<string, unknown>>(() => {
    const raw = searchParams.get("p");
    if (!raw) return initial;
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as Record<string, unknown>;
      return { ...initial, ...parsed };
    } catch {
      return initial;
    }
  }, [searchParams, initial]);

  const [props, setProps] = useState<Record<string, unknown>>(opened);
  const [viewport, setViewport] = useState<(typeof VIEWPORTS)[number]["id"]>("full");

  const active = VIEWPORTS.find((v) => v.id === viewport) ?? VIEWPORTS[3];

  const setProp = useCallback((name: string, value: unknown) => {
    setProps((current) => ({ ...current, [name]: value }));
  }, []);

  const shareLink = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("p", encodeURIComponent(JSON.stringify(props)));
    void navigator.clipboard.writeText(url.toString());
    toast.success("Link copied", {
      description: "It reopens this component with exactly these props.",
    });
  }, [props]);

  if (!entry) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface-2/50 p-8 text-center">
        <Badge variant="outline">Not vendored yet</Badge>
        <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          We haven&apos;t vendored{" "}
          <span className="font-medium text-foreground">
            {listingName ?? component.listingSlug}
          </span>{" "}
          into the preview sandbox, so this one links out instead of rendering.
          We&apos;d rather say so than show you a placeholder dressed up as a
          screenshot.
        </p>
        {component.installCommand ? (
          <div className="mx-auto mt-4 max-w-md text-left">
            <CommandLine command={component.installCommand} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-surface">
      {/* ------------------------------------------------------------ toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
        <LiveBadge />
        <span className="hidden text-[11px] text-subtle-foreground sm:inline">
          running from{" "}
          <code className="font-mono">{component.deps[0] ?? "the sandbox"}</code>
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          <div
            role="radiogroup"
            aria-label="Preview width"
            className="flex items-center gap-0.5 rounded-sm border border-border bg-surface-2 p-0.5"
          >
            {VIEWPORTS.map((option) => (
              <Hint key={option.id} label={`${option.label}${option.width ? ` · ${option.width}px` : ""}`}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={viewport === option.id}
                  aria-label={option.label}
                  onClick={() => setViewport(option.id)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-xs transition-colors",
                    viewport === option.id
                      ? "bg-surface text-foreground shadow-card"
                      : "text-subtle-foreground hover:text-foreground"
                  )}
                >
                  <option.icon className="size-3.5" />
                </button>
              </Hint>
            ))}
          </div>

          <MorphControl />

          <SaveRemix
            componentSlug={component.slug}
            componentName={component.name}
            props={props}
          />

          <Hint label="Copy a link that reopens these exact props">
            <Button variant="ghost" size="icon-sm" onClick={shareLink} aria-label="Copy link to this configuration">
              <Link2 />
            </Button>
          </Hint>
          <Hint label="Reset props">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setProps(initial)}
              aria-label="Reset props"
            >
              <RotateCcw />
            </Button>
          </Hint>
          <Hint label="Open the sandbox on its own">
            <Button variant="ghost" size="icon-sm" asChild aria-label="Open preview in a new tab">
              <a
                href={`/preview/${keyToSlug(component.registryKey ?? "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink />
              </a>
            </Button>
          </Hint>
        </div>
      </div>

      {/* ------------------------------------------------------------- stage */}
      <div className="bg-grid p-4 sm:p-6">
        <div
          className="mx-auto overflow-hidden rounded-md border border-border bg-surface shadow-card transition-[max-width] duration-300"
          style={{ maxWidth: active.width ? `${active.width}px` : "100%" }}
        >
          <PreviewFrame
            registryKey={component.registryKey ?? ""}
            props={props}
            height={entry.height ?? component.canvasHeight ?? 280}
            lazy={false}
          />
        </div>
        {active.width ? (
          <p className="mt-2 text-center font-mono text-[11px] text-subtle-foreground">
            {active.width}px — the frame is resized, so container queries inside
            respond for real
          </p>
        ) : null}
      </div>

      {/* ------------------------------------------------------- props + code */}
      <Tabs defaultValue="props" className="border-t border-border">
        <div className="flex items-center gap-2 px-3 py-2">
          <TabsList>
            <TabsTrigger value="props">
              Props
              {component.props.length ? (
                <span className="font-mono text-[10px] opacity-60">
                  {component.props.length}
                </span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="install">Install</TabsTrigger>
            {component.a11yNotes ? <TabsTrigger value="a11y">A11y</TabsTrigger> : null}
          </TabsList>
        </div>

        <TabsContent value="props" className="px-3 pb-4">
          {component.props.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {component.props.map((prop) => (
                <PropControl
                  key={prop.name}
                  prop={prop}
                  value={props[prop.name]}
                  onChange={(value) => setProp(prop.name, value)}
                />
              ))}
            </div>
          ) : (
            <p className="py-4 text-[13px] text-muted-foreground">
              This one takes no props worth playing with.
            </p>
          )}
        </TabsContent>

        <TabsContent value="usage" className="px-3 pb-4">
          <CodeBlock code={entry.usage} filename="usage.tsx" />
          {component.importLine ? (
            <div className="mt-2">
              <CodeBlock code={component.importLine} filename="import" />
            </div>
          ) : null}
        </TabsContent>

        <TabsContent value="install" className="px-3 pb-4">
          {component.installCommand ? (
            <CommandLine command={component.installCommand} />
          ) : (
            <p className="text-[13px] text-muted-foreground">
              No install command recorded for this component.
            </p>
          )}
          {component.deps.length ? (
            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                Brings with it
              </p>
              <div className="flex flex-wrap gap-1.5">
                {component.deps.map((dep) => (
                  <Badge key={dep} variant="outline" className="font-mono">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </TabsContent>

        {component.a11yNotes ? (
          <TabsContent value="a11y" className="px-3 pb-4">
            <p className="rounded-sm border border-success/25 bg-success/8 p-3 text-[13px] leading-relaxed text-foreground">
              {component.a11yNotes}
            </p>
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------ prop controls */

function PropControl({
  prop,
  value,
  onChange,
}: {
  prop: ComponentProp;
  value: unknown;
  onChange: (value: unknown) => void;
}): ReactNode {
  const id = `prop-${prop.name}`;

  if (prop.type === "boolean") {
    return (
      <label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-between gap-3 rounded-sm border border-border bg-surface-2 px-3 py-2"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[12px] font-medium">{prop.name}</span>
          {prop.description ? (
            <span className="block text-[11px] text-subtle-foreground">
              {prop.description}
            </span>
          ) : null}
        </span>
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
          className="size-4 shrink-0 accent-[var(--accent)]"
        />
      </label>
    );
  }

  if (prop.type === "enum" && prop.options?.length) {
    return (
      <div className="rounded-sm border border-border bg-surface-2 px-3 py-2">
        <label htmlFor={id} className="block font-mono text-[12px] font-medium">
          {prop.name}
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {prop.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "rounded-xs border px-2 py-0.5 font-mono text-[11px] transition-colors",
                value === option
                  ? "border-accent bg-accent-muted text-accent"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (prop.type === "number") {
    return (
      <div className="rounded-sm border border-border bg-surface-2 px-3 py-2">
        <label htmlFor={id} className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-[12px] font-medium">{prop.name}</span>
          <span className="font-mono text-[11px] tabular-nums text-subtle-foreground">
            {String(value ?? "")}
          </span>
        </label>
        <input
          id={id}
          type="range"
          min={0}
          max={Math.max(100, Number(prop.defaultValue ?? 0) * 2)}
          value={Number(value ?? 0)}
          onChange={(event) => onChange(Number(event.target.value))}
          className="mt-2 w-full accent-[var(--accent)]"
        />
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-border bg-surface-2 px-3 py-2">
      <label htmlFor={id} className="block font-mono text-[12px] font-medium">
        {prop.name}
      </label>
      <input
        id={id}
        type="text"
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-7 w-full rounded-xs border border-border bg-surface px-2 text-[12px] outline-none focus-visible:border-accent"
      />
    </div>
  );
}
