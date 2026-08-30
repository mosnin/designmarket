"use client";

import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useSession } from "@/lib/session";

export type SaveTarget = {
  type: "listing" | "component" | "collection";
  slug: string;
};

export type SaveState = {
  /** "offline" — no backend at all; "anon" — signed out; "ready" — can save */
  mode: "offline" | "anon" | "ready";
  saved: boolean;
  boards: { id: string; name: string; itemCount: number }[];
  /** toggles the save, or files it into a board when one is given */
  save: (boardId?: string) => Promise<void>;
  /** where to send a signed-out visitor, keeping their place */
  signInHref: string;
};

/**
 * The two live states of saving, in one hook.
 *
 * It may only be called under a Convex provider — with no deployment
 * configured there is no provider in the tree at all, and Convex's own hooks
 * throw rather than returning undefined. The offline case is therefore handled
 * by branching at the component, on a module constant, exactly as the session
 * provider does; that keeps hook order stable across every render.
 */
export function useSave(target: SaveTarget): SaveState {
  const { authEnabled, isAuthenticated } = useSession();
  const live = authEnabled && isAuthenticated;

  const slugs = useQuery(api.bookmarks.mineSlugs, live ? {} : "skip");
  const boards = useQuery(api.bookmarks.myBoards, live ? {} : "skip");
  const toggle = useMutation(api.bookmarks.toggle);

  // Covers only the round trip, so a fast double tap can't show the wrong icon.
  const [pending, setPending] = useState<boolean | null>(null);
  const key = `${target.type}:${target.slug}`;
  const saved = pending ?? (slugs?.includes(key) ?? false);

  async function save(boardId?: string): Promise<void> {
    if (!live) return;
    setPending(boardId ? true : !saved);
    try {
      const result = await toggle({
        targetType: target.type,
        targetSlug: target.slug,
        ...(boardId ? { boardId: boardId as Id<"collections"> } : {}),
      });
      setPending(null);
      if (result.filed) toast.success("Filed to your board");
      else if (result.saved) toast.success("Saved");
      else toast("Removed from your saves");
    } catch {
      setPending(null);
      toast.error("Couldn't save that — try again");
    }
  }

  return {
    mode: !authEnabled ? "offline" : !isAuthenticated ? "anon" : "ready",
    saved,
    boards: boards ?? [],
    save,
    signInHref:
      typeof window === "undefined"
        ? "/signin"
        : `/signin?next=${encodeURIComponent(window.location.pathname + window.location.search)}`,
  };
}

export function offlineNotice(): void {
  toast("Accounts aren't available on this deployment", {
    description:
      "Browsing and rendering work without a backend. Saving needs one — run npx convex dev.",
  });
}
