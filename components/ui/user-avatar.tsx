"use client";

import type { ReactNode } from "react";
import AgentAvatar from "@/components/smoothui/agent-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * The one place a person is drawn.
 *
 * A saved profile photo always wins. Without one, `AgentAvatar` generates a
 * deterministic pattern from the account's handle — so the same person is the
 * same avatar on every surface and across sessions, and two people are never
 * accidentally the same. Radix falls back on its own when a photo URL is set
 * but fails to load, so a dead image degrades to the generated avatar rather
 * than to an empty circle.
 */

type UserAvatarProps = {
  /** Stable, unique per account — the handle, so the avatar survives renames. */
  seed: string;
  /** A saved profile photo. Absent or broken falls through to the pattern. */
  src?: string | null | undefined;
  /** Rendered diameter in px. Canvas needs a number, not a Tailwind class. */
  size?: number;
  /**
   * Off by default, and deliberately. Each animated avatar holds its own
   * requestAnimationFrame loop redrawing 36 shadowed cells a frame; a member
   * table with fifty rows would run fifty of them forever. Opt in for the one
   * large avatar on a page, not for avatars in a list.
   */
  animated?: boolean;
  className?: string;
};

export function UserAvatar({
  seed,
  src,
  size = 32,
  animated = false,
  className,
}: UserAvatarProps): ReactNode {
  return (
    <Avatar
      // No border on the shell. Tailwind boxes are border-box, so a 1px border
      // leaves `size - 2` of content and `overflow-hidden` shaves 1px off every
      // edge of a `size`-wide canvas — which crops exactly the outer glow ring
      // the generated avatar draws. The photo keeps a border of its own below.
      className={cn("shrink-0 border-0 bg-transparent", className)}
      style={{ height: size, width: size }}
    >
      {src ? (
        <AvatarImage src={src} alt="" className="border-border border" />
      ) : null}
      <AvatarFallback className="bg-transparent p-0">
        <AgentAvatar seed={seed} size={size} animated={animated} />
      </AvatarFallback>
    </Avatar>
  );
}
