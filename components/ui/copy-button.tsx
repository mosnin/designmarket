"use client";

import { Icon } from "@/components/icon";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Copy with a real confirmation. The state is announced through aria-live
 * rather than only swapping the icon, because "did that work?" is exactly the
 * question a purely visual confirmation leaves open.
 */
export function CopyButton({
  value,
  label = "Copy",
  className,
  size = "sm",
}: {
  value: string;
  label?: string;
  className?: string;
  size?: "sm" | "icon";
}): ReactNode {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard denied — the text is selectable either way */
    }
  }, [value]);

  return (
    <>
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? "Copied" : label}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
          size === "icon" ? "size-7 justify-center" : "h-7 px-2 text-[12px]",
          className
        )}
      >
        {copied ? (
          <Icon name="check" className="size-3.5 text-success" />
        ) : (
          <Icon name="copy" className="size-3.5" />
        )}
        {size === "sm" ? (copied ? "Copied" : label) : null}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </>
  );
}
