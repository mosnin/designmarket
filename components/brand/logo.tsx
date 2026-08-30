import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/config";

/**
 * The mark is a display case: an outer vitrine with a component "running"
 * inside it. The inner square is painted in the live colour.
 */
export function LogoMark({ className }: { className?: string }): ReactNode {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <rect
        x="1.25"
        y="1.25"
        width="21.5"
        height="21.5"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.9"
      />
      <rect x="6" y="6" width="12" height="12" rx="2.5" fill="var(--live)" />
      <path
        d="M9 12.4 11.1 14.5 15.2 10"
        stroke="var(--background)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}): ReactNode {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={markClassName} />
      <span className="text-[15px] font-semibold tracking-tight">
        {siteConfig.name}
      </span>
    </span>
  );
}
