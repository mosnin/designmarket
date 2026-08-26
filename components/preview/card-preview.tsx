"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

/**
 * The registry pulls in Recharts, Motion and a pile of Radix packages, so it
 * is loaded only on pages that actually show a preview — and only in the
 * browser, since a card preview is decorative and has nothing to contribute to
 * the server-rendered HTML.
 */
const InlinePreview = dynamic(
  () => import("./inline-preview").then((m) => m.InlinePreview),
  {
    ssr: false,
    loading: () => (
      <span className="font-mono text-[10px] uppercase tracking-widest text-subtle-foreground">
        loading
      </span>
    ),
  }
);

export function CardPreview({
  registryKey,
  props,
  fitHeight = 190,
}: {
  registryKey: string;
  props?: Record<string, unknown>;
  /** Card preview boxes are about this tall; taller components scale to fit. */
  fitHeight?: number;
}): ReactNode {
  return (
    <InlinePreview
      registryKey={registryKey}
      {...(props ? { props } : {})}
      fitHeight={fitHeight}
      className="size-full"
    />
  );
}
