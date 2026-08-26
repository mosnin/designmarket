"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { IconTile } from "@/components/surface/icon-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { sectionForKind } from "@/lib/taxonomy";
import { timeAgo } from "@/lib/utils";

const STATUSES = ["live", "pending", "rejected", "draft"] as const;

/**
 * The whole index, editable.
 *
 * Only the fields a person decides are writable here — status, featured,
 * verified. Everything that gets fetched stays read-only, so no amount of
 * admin access can hand a listing a download count it didn't earn. What the
 * table offers instead is a refetch button, which is the honest version of
 * the same impulse.
 */
export function AdminListingTable(): ReactNode {
  const [status, setStatus] = useState<string>("live");
  const [q, setQ] = useState("");
  const rows = useQuery(api.admin.listings, { status, q: q.trim() || undefined });
  const patch = useMutation(api.admin.patchListing);
  const refetch = useMutation(api.admin.refetch);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setStatus(option)}
            data-active={status === option || undefined}
            className="t-press rounded-full px-3 py-1.5 text-[13px] font-medium capitalize text-muted-foreground hover:text-foreground data-active:bg-muted/50 data-active:text-foreground"
          >
            {option}
          </button>
        ))}
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Filter by name or slug"
          className="ml-auto w-56 rounded-full"
        />
      </div>

      {rows === undefined ? (
        <div className="mt-4 flex flex-col gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-sm" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-[13px] text-muted-foreground">
          Nothing here{q ? ` matching “${q}”` : ""}.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-foreground/10 border-y border-border">
          {rows.map((row) => {
            return (
              <li key={row.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <IconTile monogram={row.monogram} color={row.color} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`${sectionForKind(row.kind)?.href ?? "/explore"}/${row.slug}`}
                      className="text-[14px] font-medium hover:text-foreground"
                    >
                      {row.name}
                    </Link>
                    {row.featured ? <Badge variant="accent">Featured</Badge> : null}
                    {row.verified ? <Badge variant="outline">Verified</Badge> : null}
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {row.tagline}
                  </p>
                </div>

                <span
                  className="shrink-0 font-mono text-[11px] text-foreground/50"
                  title={
                    row.fetchedAt
                      ? `Facts refreshed ${timeAgo(row.fetchedAt)}`
                      : "Facts have never been fetched for this listing"
                  }
                >
                  {row.fetchedAt ? timeAgo(row.fetchedAt) : "never fetched"}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <Toggle
                    on={row.featured}
                    label="Feature"
                    onClick={() =>
                      void patch({
                        id: row.id as Id<"listings">,
                        featured: !row.featured,
                      })
                    }
                  />
                  <Toggle
                    on={row.verified}
                    label="Verify"
                    onClick={() =>
                      void patch({
                        id: row.id as Id<"listings">,
                        verified: !row.verified,
                      })
                    }
                  />
                  {row.repo || row.npm ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                      aria-label={`Refetch facts for ${row.name}`}
                      onClick={async () => {
                        await refetch({ slug: row.slug });
                        toast.success("Refetching from source");
                      }}
                    >
                      <Icon
                        name="reset"
                        size={14}
                        className={row.stale ? "text-warning" : undefined}
                      />
                    </Button>
                  ) : null}
                  {row.status !== "live" ? (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="rounded-full"
                      onClick={() =>
                        void patch({ id: row.id as Id<"listings">, status: "live" })
                      }
                    >
                      Publish
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="rounded-full"
                      onClick={() =>
                        void patch({ id: row.id as Id<"listings">, status: "draft" })
                      }
                    >
                      Unpublish
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Toggle({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`t-press rounded-full px-2.5 py-1 text-[12px] transition-colors ${
        on ? "text-foreground" : "text-foreground/50 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
