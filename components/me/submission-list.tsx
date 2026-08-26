"use client";

import { useQuery } from "convex/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icon";
import { IconTile } from "@/components/surface/icon-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { sectionForKind } from "@/lib/taxonomy";
import { timeAgo } from "@/lib/utils";

const STATUS: Record<string, { label: string; note: string; tone: string }> = {
  pending: {
    label: "In review",
    note: "A moderator checks that it is what it says it is. Usually a day.",
    tone: "text-muted-foreground",
  },
  live: {
    label: "Live",
    note: "Indexed, searchable, and refreshed from source daily.",
    tone: "text-live",
  },
  rejected: {
    label: "Not accepted",
    note: "It didn't make the index this time.",
    tone: "text-danger",
  },
  draft: { label: "Draft", note: "Not submitted yet.", tone: "text-subtle-foreground" },
};

export function SubmissionList(): ReactNode {
  const rows = useQuery(api.submit.mine, {});

  if (rows === undefined) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <h2 className="text-[15px] font-semibold">Nothing submitted yet</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Submitting is one field. Paste a repo or a package and the importer
          fills in the rest from source — including the Ship Score you&apos;d
          get.
        </p>
        <Button variant="primary" size="sm" className="mt-4 rounded-full" asChild>
          <Link href="/submit">Submit something</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => {
        const status = STATUS[row.status] ?? STATUS.pending!;
        return (
          <li
            key={row.id}
            id={row.slug}
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 dark:border-transparent"
          >
            <IconTile monogram={row.monogram} color={row.color} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {row.status === "live" ? (
                  <Link
                    href={`${sectionForKind(row.kind)?.href ?? "/explore"}/${row.slug}`}
                    className="text-[15px] font-medium hover:text-accent"
                  >
                    {row.name}
                  </Link>
                ) : (
                  <span className="text-[15px] font-medium">{row.name}</span>
                )}
                <Badge variant="outline">{status.label}</Badge>
              </div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{row.tagline}</p>
              <p className={`mt-1.5 text-[12px] ${status.tone}`}>
                {status.note} · submitted {timeAgo(row.createdAt)}
              </p>
            </div>
            {row.status === "live" ? (
              <Icon name="check" size={16} className="mt-1 text-live" />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
