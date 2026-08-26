"use client";

import { useMutation, useQuery } from "convex/react";
import { Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/utils";

export function RemixList(): ReactNode {
  const remixes = useQuery(api.remixes.mine, {});
  const remove = useMutation(api.remixes.remove);

  if (remixes === undefined) {
    return (
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (remixes.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-surface-2/50 px-6 py-14 text-center">
        <Wand2 className="mx-auto size-6 text-subtle-foreground" strokeWidth={1.5} />
        <h2 className="mt-3 text-[15px] font-semibold">No remixes yet</h2>
        <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Open any component, change its props until it looks like your app, and
          save the setup. It keeps pointing at the original, so it stays current
          when the library ships an update.
        </p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/components">Browse components</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {remixes.map((remix) => (
        <li
          key={remix.id}
          className="flex items-center gap-3 rounded-md border border-border bg-surface p-3"
        >
          <div className="min-w-0 flex-1">
            <Link
              href={`/components/${remix.componentSlug}?p=${encodeURIComponent(
                JSON.stringify(remix.props)
              )}`}
              className="block truncate text-[14px] font-medium hover:text-accent"
            >
              {remix.name}
            </Link>
            <p className="mt-0.5 truncate font-mono text-[11px] text-subtle-foreground">
              {remix.componentSlug} · saved {timeAgo(remix.updatedAt)}
            </p>
          </div>
          <Badge variant="outline">{remix.visibility}</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${remix.name}`}
            onClick={async () => {
              try {
                await remove({ id: remix.id });
                toast.success("Remix deleted");
              } catch {
                toast.error("Could not delete that remix");
              }
            }}
          >
            <Trash2 />
          </Button>
        </li>
      ))}
    </ul>
  );
}
