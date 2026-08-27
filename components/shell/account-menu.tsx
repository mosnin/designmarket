"use client";

import { Icon } from "@/components/icon";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useSession } from "@/lib/session";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

export function AccountMenu(): ReactNode {
  const { authEnabled, isLoading, isAuthenticated, viewer, isStaff, isPro } =
    useSession();
  const { signOut } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  if (!isAuthenticated || !viewer) {
    return (
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
          <Link href="/signin">Log in</Link>
        </Button>
        <Button variant="primary" size="sm" asChild className="rounded-full">
          <Link href="/signup">
            {authEnabled ? "Sign up" : "Get started"}
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-full transition-opacity hover:opacity-80"
          aria-label="Account menu"
        >
          <Avatar>
            {viewer.avatarUrl ? (
              <AvatarImage src={viewer.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>{initials(viewer.displayName)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <div className="flex items-start gap-2 px-2 py-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              {viewer.displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{viewer.handle}
            </p>
          </div>
          {isPro ? (
            <Badge variant="accent" size="sm">
              Pro
            </Badge>
          ) : null}
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/u/${viewer.handle}`}>
            <Icon name="profile" /> Public profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/me/bookmarks">
            <Icon name="bookmark" /> Bookmarks
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/me/boards">
            <Icon name="boards" /> Boards
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/me/remixes">
            <Icon name="remix" /> Remixes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/submit">
            <Icon name="submit" /> Submit a listing
          </Link>
        </DropdownMenuItem>

        {isStaff ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Staff</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <Icon name="staff" /> Admin dashboard
              </Link>
            </DropdownMenuItem>
          </>
        ) : null}

        <DropdownMenuSeparator />

        {!isPro ? (
          <DropdownMenuItem asChild>
            <Link href="/pricing">
              <Icon name="upgrade" /> Upgrade to Pro
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/me/settings">
            <Icon name="settings" /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            await signOut?.();
            router.push("/");
          }}
        >
          <Icon name="signOut" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
