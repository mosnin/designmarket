import * as icons from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type LucideIcon = (props: { className?: string; strokeWidth?: number }) => ReactNode;

/**
 * Taxonomy stores icon names as strings so it stays serialisable and can be
 * mirrored into Convex. This resolves them, with a stable fallback.
 */
export function CategoryIcon({
  name,
  className,
  strokeWidth = 1.75,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}): ReactNode {
  const registry = icons as unknown as Record<string, LucideIcon | undefined>;
  const Icon = registry[name] ?? registry.Square;
  if (!Icon) return null;
  return <Icon className={cn("size-4", className)} strokeWidth={strokeWidth} />;
}
