"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { formatDate } from "@/lib/utils";

const ROLES = ["member", "moderator", "admin"] as const;

/**
 * Roles and plans are admin-only, and the server enforces that — a moderator
 * loading this page sees the list and gets an error if they try to change
 * anything, because the check that matters lives next to the data.
 */
export function AdminMemberTable({ role }: { role: string }): ReactNode {
  const [q, setQ] = useState("");
  const members = useQuery(api.admin.members, { q: q.trim() || undefined });
  const setRole = useMutation(api.admin.setRole);
  const setPlan = useMutation(api.admin.setPlan);
  const canEdit = role === "admin";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Filter by handle or name"
          className="w-64 rounded-full"
        />
        {canEdit ? null : (
          <p className="text-[12px] text-muted-foreground">
            Read-only — changing roles and plans is an admin action.
          </p>
        )}
      </div>

      {members === undefined ? (
        <div className="mt-4 flex flex-col gap-1.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border">
          {members.map((member) => (
            <li key={member.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/u/${member.handle}`}
                  className="text-[14px] font-medium hover:text-accent"
                >
                  {member.displayName}
                </Link>
                <p className="text-[12px] text-muted-foreground">
                  @{member.handle} · joined {formatDate(member.createdAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {ROLES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={!canEdit}
                    aria-pressed={member.role === option}
                    onClick={async () => {
                      try {
                        await setRole({
                          id: member.id as Id<"profiles">,
                          role: option,
                        });
                        toast.success(`@${member.handle} is now ${option}`);
                      } catch (thrown) {
                        toast.error(
                          thrown instanceof Error ? thrown.message : "Couldn't do that"
                        );
                      }
                    }}
                    className={`t-press rounded-full px-2.5 py-1 text-[12px] capitalize transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                      member.role === option
                        ? "text-accent"
                        : "text-subtle-foreground hover:text-foreground"
                    }`}
                  >
                    {option}
                  </button>
                ))}

                <span aria-hidden className="mx-1 h-4 w-px bg-border" />

                <Button
                  variant="ghost"
                  size="xs"
                  className="rounded-full"
                  disabled={!canEdit}
                  onClick={async () => {
                    const next = member.plan === "pro" ? "free" : "pro";
                    await setPlan({ id: member.id as Id<"profiles">, plan: next });
                    toast.success(`@${member.handle} moved to ${next}`);
                  }}
                >
                  {member.plan === "pro" ? "Pro" : "Free"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
