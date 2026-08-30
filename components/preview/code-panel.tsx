"use client";

import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

/**
 * The code panel is labelled "usage", never "source".
 *
 * What we can honestly show is how you call the real package — not a copy of
 * its internals. Dressing a usage snippet up as the library's source would be
 * the same category of lie as a screenshot pretending to be a render.
 */
export function CodeBlock({
  code,
  filename,
  language = "tsx",
  className,
}: {
  code: string;
  filename?: string;
  language?: string;
  className?: string;
}): ReactNode {
  return (
    <figure
      className={cn(
        // No fill: this sits inside a panel, and a filled block inside a
        // filled block is exactly the nesting the reference avoids.
        "overflow-hidden rounded-md border border-border",
        className
      )}
    >
      <figcaption className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <span className="font-mono text-[11px] text-foreground/50">
          {filename ?? language}
        </span>
        <CopyButton value={code} className="ml-auto" />
      </figcaption>
      <pre className="overflow-x-auto scrollbar-thin p-3 text-[12px] leading-relaxed">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </figure>
  );
}

export function CommandLine({
  command,
  className,
}: {
  command: string;
  className?: string;
}): ReactNode {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm border border-border py-1.5 pl-3 pr-1.5",
        className
      )}
    >
      <span aria-hidden className="select-none font-mono text-[12px] text-foreground/50">
        $
      </span>
      <code className="min-w-0 flex-1 overflow-x-auto scrollbar-none whitespace-nowrap font-mono text-[12px] text-foreground">
        {command}
      </code>
      <CopyButton value={command} size="icon" label="Copy install command" />
    </div>
  );
}
