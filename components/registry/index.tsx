"use client";

import type { RegistryKey } from "@/lib/registry-manifest";
import { chartRegistry } from "./charts";
import { motionRegistry } from "./motion";
import { radixRegistry } from "./radix";
import { shadcnRegistry } from "./shadcn";
import type { RegistryEntry } from "./types";

/**
 * The render layer's implementations.
 *
 * Typed as `Record<RegistryKey, RegistryEntry>` on purpose: TypeScript refuses
 * to compile if a key in the manifest has no implementation, so a component
 * can never claim "LIVE" on a card and then render an empty box.
 */
export const registry: Record<RegistryKey, RegistryEntry> = {
  ...shadcnRegistry,
  ...radixRegistry,
  ...chartRegistry,
  ...motionRegistry,
};

export function getRegistryEntry(key: string): RegistryEntry | null {
  return (registry as Record<string, RegistryEntry | undefined>)[key] ?? null;
}

export type { RegistryEntry };
