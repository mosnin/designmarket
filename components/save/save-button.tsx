"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AUTH_ENABLED } from "@/lib/session";
import { cn } from "@/lib/utils";
import { offlineNotice, useSave, type SaveTarget } from "./use-save";

/**
 * One tap saves. It never asks "which board?" — that question is why most
 * people's bookmarks are empty. Filing is a second, optional gesture on the
 * same control, and it moves the save rather than making a second one.
 */
type SaveButtonProps = {
  target: SaveTarget;
  /** show the word next to the icon, for detail pages */
  label?: boolean;
  size?: "xs" | "sm" | "icon-sm" | "icon";
  className?: string;
};

export function SaveButton(props: SaveButtonProps): ReactNode {
  // With no deployment there is no Convex provider in the tree, so the live
  // control cannot even be mounted. AUTH_ENABLED is a module constant, so this
  // branch is fixed for the life of the bundle and hook order never shifts.
  if (!AUTH_ENABLED) {
    return (
      <Button
        variant="outline"
        size={props.size ?? "sm"}
        className={cn("rounded-full", props.className)}
        onClick={offlineNotice}
      >
        <Icon name="bookmark" />
        {props.label ? "Save" : <span className="sr-only">Save</span>}
      </Button>
    );
  }
  return <LiveSaveButton {...props} />;
}

function LiveSaveButton({
  target,
  label,
  size = "sm",
  className,
}: SaveButtonProps): ReactNode {
  const state = useSave(target);
  const text = label ? (state.saved ? "Saved" : "Save") : null;

  if (state.mode === "anon") {
    return (
      <Button variant="outline" size={size} className={cn("rounded-full", className)} asChild>
        <Link href={state.signInHref}>
          <Icon name="bookmark" />
          {text ?? <span className="sr-only">Sign in to save</span>}
        </Link>
      </Button>
    );
  }

  const trigger = (
    <Button
      variant={state.saved ? "secondary" : "outline"}
      size={size}
      className={cn("rounded-full", state.saved && "text-accent", className)}
      onClick={() => void state.save()}
      aria-pressed={state.saved}
    >
      <Icon name="bookmark" className={state.saved ? "fill-current" : undefined} />
      {text ?? <span className="sr-only">Save</span>}
    </Button>
  );

  if (!state.boards.length) return trigger;

  return (
    <span className="inline-flex items-center">
      {trigger}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="-ml-1 rounded-full"
            aria-label="File in a board"
          >
            <Icon name="boards" size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>File in a board</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {state.boards.map((board) => (
            <DropdownMenuItem key={board.id} onSelect={() => void state.save(board.id)}>
              <Icon name="boards" size={14} />
              <span className="truncate">{board.name}</span>
              <span className="ml-auto text-[11px] text-foreground/50">
                {board.itemCount}
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/me/boards">
              <Icon name="plus" size={14} />
              New board
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  );
}

/**
 * The same control wearing the utility rail's clothes: a full-width text row,
 * not a pill. Detail pages have one of these; grids have the pill.
 */
const RAIL_CLASS =
  "flex w-full items-center gap-2.5 rounded-sm px-2 py-2 text-left text-[13px] text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground";

export function SaveRailItem({ target }: { target: SaveTarget }): ReactNode {
  if (!AUTH_ENABLED) {
    return (
      <button type="button" className={RAIL_CLASS} onClick={offlineNotice}>
        <Icon name="bookmark" size={15} />
        Save to a board
      </button>
    );
  }
  return <LiveSaveRailItem target={target} />;
}

function LiveSaveRailItem({ target }: { target: SaveTarget }): ReactNode {
  const state = useSave(target);
  const className = RAIL_CLASS;

  if (state.mode === "anon") {
    return (
      <Link href={state.signInHref} className={className}>
        <Icon name="bookmark" size={15} />
        Save to a board
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cn(className, state.saved && "text-accent")}
      aria-pressed={state.saved}
      onClick={() => void state.save()}
    >
      <Icon
        name="bookmark"
        size={15}
        className={state.saved ? "fill-current" : undefined}
      />
      {state.saved ? "Saved" : "Save to a board"}
    </button>
  );
}
