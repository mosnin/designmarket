"use client";

import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

/**
 * One client for the whole app, created at module scope so it survives
 * navigation. When no deployment is configured the provider is skipped
 * entirely and the tree renders against the bundled seed data instead.
 */
const url = process.env.NEXT_PUBLIC_CONVEX_URL;
const client = url
  ? new ConvexReactClient(url, { verbose: false })
  : null;

export function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  if (!client) return children;
  return (
    <ConvexAuthNextjsProvider client={client}>{children}</ConvexAuthNextjsProvider>
  );
}
