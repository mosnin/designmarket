"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { IconTile } from "@/components/surface/icon-tile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { sectionForKind } from "@/lib/taxonomy";
import { timeAgo } from "@/lib/utils";

type Filter = "all" | "listing" | "component" | "collection";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "listing", label: "Listings" },
  { id: "component", label: "Components" },
  { id: "collection", label: "Stacks" },
];

function hrefFor(item: { targetType: string; kind: string; slug: string }): string {
  if (item.targetType === "component") return `/components/${item.slug}`;
  if (item.targetType === "collection") return `/stacks/${item.slug}`;
  return `${sectionForKind(item.kind)?.href ?? "/explore"}/${item.slug}`;
}

export function BookmarkList(): ReactNode {
  const saved = useQuery(api.bookmarks.saved, {});
  const boards = useQuery(api.bookmarks.myBoards, {});
  const remove = useMutation(api.bookmarks.removeSaved);
  const fileInto = useMutation(api.bookmarks.fileInto);
  const [filter, setFilter] = useState<Filter>("all");

  const shown = useMemo(
    () => (saved ?? []).filter((s) => filter === "all" || s.targetType === filter),
    [saved, filter]
  );

  const boardName = useMemo(() => {
    const map = new Map<string, string>();
    for (const board of boards ?? []) map.set(board.id, board.name);
    return map;
  }, [boards]);

  if (saved === undefined) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-sm" />
        ))}
      </div>
    );
  }

  if (saved.length === 0) {
    return (
      <div className="rounded-sm border border-dashed border-border px-6 py-14 text-center">
        <h2 className="text-[15px] font-semibold">Nothing saved yet</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Saving is one tap and never asks where to put it. Sort it into boards
          later, or don&apos;t — a flat pile you actually use beats a taxonomy
          you don&apos;t.
        </p>
        <Button variant="outline" size="sm" className="mt-4 rounded-full" asChild>
          <Link href="/explore">Browse the index</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1">
        {FILTERS.map((tab) => {
          const count =
            tab.id === "all"
              ? saved.length
              : saved.filter((s) => s.targetType === tab.id).length;
          if (!count && tab.id !== "all") return null;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              data-active={filter === tab.id || undefined}
              className="t-press rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:bg-muted data-active:bg-muted data-active:text-foreground"
            >
              {tab.label}
              <span className="ml-1.5 text-[11px] text-foreground/50">{count}</span>
            </button>
          );
        })}
      </div>

      <ul className="mt-4 flex flex-col gap-1">
        {shown.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 rounded-sm px-2 py-2.5 transition-colors hover:bg-muted/50"
          >
            <IconTile monogram={item.monogram} color={item.color} />
            <div className="min-w-0 flex-1">
              {item.missing ? (
                <p className="text-[15px] font-medium text-muted-foreground line-through">
                  {item.name}
                </p>
              ) : (
                <Link
                  href={hrefFor(item)}
                  className="text-[15px] font-medium hover:text-accent"
                >
                  {item.name}
                </Link>
              )}
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                {item.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-foreground/50">
              {item.boardId ? (
                <span className="hidden items-center gap-1 rounded-full bg-muted px-2 py-0.5 sm:inline-flex">
                  <Icon name="boards" size={12} />
                  {boardName.get(item.boardId) ?? "Board"}
                </span>
              ) : null}
              <span className="hidden sm:inline">{timeAgo(item.createdAt)}</span>
              {item.boardId ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full opacity-0 group-hover:opacity-100"
                  aria-label="Unfile"
                  onClick={() =>
                    void fileInto({ id: item.id as Id<"bookmarks">, boardId: null })
                  }
                >
                  <Icon name="minus" size={14} />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${item.name}`}
                onClick={async () => {
                  await remove({ id: item.id as Id<"bookmarks"> });
                  toast("Removed");
                }}
              >
                <Icon name="close" size={14} />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
