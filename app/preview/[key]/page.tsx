import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { PreviewRuntime } from "@/components/preview/preview-runtime";
import {
  isRegistryKey,
  keyToSlug,
  slugToKey,
  REGISTRY_KEYS,
} from "@/lib/registry-manifest";

/**
 * The render target. Loaded inside an iframe from the same origin; the
 * frame-ancestors header in next.config.ts stops anyone else embedding it.
 *
 * Registry keys contain a slash, so the route uses the flat `shadcn--button`
 * form and converts back before lookup.
 */
export function generateStaticParams(): { key: string }[] {
  return REGISTRY_KEYS.map((key) => ({ key: keyToSlug(key) }));
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: Promise<{ scheme?: string; props?: string }>;
}): Promise<ReactNode> {
  const { key: raw } = await params;
  const key = slugToKey(raw);
  if (!isRegistryKey(key)) notFound();

  const { scheme, props } = await searchParams;

  return (
    <PreviewRuntime
      registryKey={key}
      initialScheme={scheme === "dark" ? "dark" : "light"}
      initialPropsJson={props ?? null}
    />
  );
}
