"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { IconTileStack } from "@/components/surface/icon-tile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { timeAgo } from "@/lib/utils";

/**
 * Boards are shelves, not folders — a save lives on at most one, and deleting
 * a shelf never destroys what was on it. That is why the delete button here
 * can be a single click with no scary modal: the worst case is "those saves
 * went back to the pile".
 */
export function BoardList(): ReactNode {
  const boards = useQuery(api.bookmarks.myBoards, {});
  const saved = useQuery(api.bookmarks.saved, {});
  const create = useMutation(api.bookmarks.createBoard);
  const remove = useMutation(api.bookmarks.deleteBoard);
  const rename = useMutation(api.bookmarks.renameBoard);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const value = name.trim();
    if (!value) return;
    setBusy(true);
    try {
      await create({ name: value });
      setName("");
      toast.success(`Created “${value}”`);
    } catch {
      toast.error("Couldn't create that board");
    } finally {
      setBusy(false);
    }
  }

  const contents = new Map<string, { monogram: string; color: string }[]>();
  for (const item of saved ?? []) {
    if (!item.boardId) continue;
    const list = contents.get(item.boardId) ?? [];
    list.push({ monogram: item.monogram, color: item.color });
    contents.set(item.boardId, list);
  }

  return (
    <div>
      <form onSubmit={submit} className="flex max-w-md items-center gap-2">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="New board — “dashboard rebuild”"
          maxLength={80}
          className="rounded-full"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          className="rounded-full"
          disabled={busy || !name.trim()}
        >
          <Icon name="plus" size={14} />
          Create
        </Button>
      </form>

      {boards === undefined ? (
        <div className="mt-6 flex flex-col gap-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <h2 className="text-[15px] font-semibold">No boards yet</h2>
          <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
            A board is a shelf for saves you already made. Make one when the
            pile gets big enough to be worth sorting — not before.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {boards.map((board) => (
            <li
              key={board.id}
              className="group rounded-2xl border border-border bg-surface p-4 dark:border-transparent"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <input
                    defaultValue={board.name}
                    aria-label="Board name"
                    className="w-full bg-transparent text-[15px] font-semibold outline-none focus:text-accent"
                    onBlur={(event) => {
                      const next = event.target.value.trim();
                      if (next && next !== board.name) {
                        void rename({
                          boardId: board.id as Id<"collections">,
                          name: next,
                        });
                      }
                    }}
                  />
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {board.itemCount + (contents.get(board.id)?.length ?? 0)} saved ·{" "}
                    {board.visibility === "public" ? "Public" : "Private"} ·{" "}
                    {timeAgo(board.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full opacity-0 group-hover:opacity-100"
                  aria-label={`Delete ${board.name}`}
                  onClick={async () => {
                    await remove({ boardId: board.id as Id<"collections"> });
                    toast("Board deleted — its saves went back to your pile");
                  }}
                >
                  <Icon name="delete" size={14} />
                </Button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <IconTileStack items={contents.get(board.id) ?? []} />
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    className="rounded-full"
                    onClick={() =>
                      void rename({
                        boardId: board.id as Id<"collections">,
                        visibility: board.visibility === "public" ? "private" : "public",
                      })
                    }
                  >
                    {board.visibility === "public" ? "Make private" : "Make public"}
                  </Button>
                  {board.visibility === "public" ? (
                    <Button variant="ghost" size="xs" className="rounded-full" asChild>
                      <Link href={`/stacks/${board.slug}`}>
                        View
                        <Icon name="forward" size={12} />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
