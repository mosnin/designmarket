"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = (): (() => void) => () => {};

/**
 * True only after hydration. `useSyncExternalStore` with a constant server
 * snapshot is the sanctioned way to ask this — it avoids the setState-in-effect
 * pattern that causes a cascading render on every mount.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}
