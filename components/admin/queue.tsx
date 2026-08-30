"use client";

import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { IconTile } from "@/components/surface/icon-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { categoryBySlug } from "@/lib/taxonomy";
import { timeAgo } from "@/lib/utils";

/**
 * The review queue.
 *
 * A moderator's real question is "is this what it says it is", and the answer
 * lives at the source — so every row leads with the links that answer it and
 * the facts we already fetched, rather than with the submitter's prose.
 */
export function AdminQueue(): ReactNode {
  const stats = useQuery(api.admin.stats, {});
  const pending = useQuery(api.submit.queue, { status: "pending" });
  const decide = useMutation(api.submit.decide);
  const [busy, setBusy] = useState<string | null>(null);

  async function act(id: string, decision: "approve" | "reject", name: string) {
    setBusy(id);
    try {
      await decide({ id: id as Id<"listings">, decision });
      toast.success(
        decision === "approve"
          ? `${name} is live — its facts are being refreshed now`
          : `${name} rejected`
      );
    } catch {
      toast.error("That didn't go through");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <StatRow stats={stats} />

      <h2 className="mt-8 text-xs font-medium uppercase tracking-wider text-foreground/40">
        Waiting for review
      </h2>

      {pending === undefined ? (
        <div className="mt-3 flex flex-col gap-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-sm" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <p className="mt-3 text-[13px] text-muted-foreground">
          Nothing waiting. Submissions land here the moment someone sends one.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-foreground/10 border-y border-border">
          {pending.map((row) => (
            <li key={row.id} className="flex flex-wrap items-start gap-4 py-4">
              <IconTile monogram={row.name.slice(0, 2).toUpperCase()} color="#2563eb" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-serif text-lg font-medium">{row.name}</p>
                  <Badge variant="outline">{row.kind}</Badge>
                  <Badge variant="outline">{row.license}</Badge>
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{row.tagline}</p>

                <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-foreground/50">
                  {row.facts?.weeklyDownloads ? (
                    <span>{row.facts.weeklyDownloads.toLocaleString()}/wk</span>
                  ) : null}
                  {row.facts?.githubStars ? (
                    <span>{row.facts.githubStars.toLocaleString()}★</span>
                  ) : null}
                  {row.facts?.version ? <span>v{row.facts.version}</span> : null}
                  <span>
                    by @{row.submittedByHandle ?? "unknown"} · {timeAgo(row.createdAt)}
                  </span>
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px]">
                  {row.repo ? <SourceLink href={row.repo} label="Repository" /> : null}
                  {row.npm ? (
                    <SourceLink
                      href={`https://www.npmjs.com/package/${row.npm}`}
                      label={row.npm}
                    />
                  ) : null}
                  {row.homepage ? (
                    <SourceLink href={row.homepage} label="Homepage" />
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {row.categories.map((slug) => (
                    <Badge key={slug} variant="outline">
                      {categoryBySlug.get(slug)?.name ?? slug}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-full"
                  disabled={busy === row.id}
                  onClick={() => void act(row.id, "approve", row.name)}
                >
                  <Icon name="check" size={14} />
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  disabled={busy === row.id}
                  onClick={() => void act(row.id, "reject", row.name)}
                >
                  Reject
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SourceLink({ href, label }: { href: string; label: string }): ReactNode {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-foreground hover:underline"
    >
      {label}
      <Icon name="external" size={11} />
    </a>
  );
}

function StatRow({
  stats,
}: {
  stats: typeof api.admin.stats._returnType | undefined;
}): ReactNode {
  const cells: { label: string; value: string; hint?: string }[] = stats
    ? [
        { label: "Waiting", value: String(stats.pending) },
        { label: "Live", value: String(stats.live) },
        { label: "Components", value: String(stats.components) },
        {
          label: "Graded on facts",
          value: `${stats.withFacts}/${stats.live}`,
          hint: "Live listings with fetched facts behind their Ship Score",
        },
        {
          label: "Stale",
          value: String(stats.stale),
          hint: "Live listings whose facts are over a week old",
        },
        { label: "Members", value: `${stats.members}` },
        { label: "Pro", value: String(stats.pro) },
      ]
    : [];

  if (!stats) {
    return <Skeleton className="h-16 w-full rounded-sm" />;
  }

  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-4 xl:grid-cols-7">
      {cells.map((cell) => (
        <div key={cell.label} title={cell.hint}>
          <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
            {cell.label}
          </dt>
          <dd className="mt-1 font-mono text-[20px] leading-none tabular-nums">
            {cell.value}
          </dd>
        </div>
      ))}
      {stats.stale > 0 ? (
        <p className="col-span-full text-[12px] text-muted-foreground">
          <Link href="/admin/listings" className="text-foreground underline underline-offset-4">
            {stats.stale} listings
          </Link>{" "}
          have facts older than a week. The daily cron refreshes them; you can
          force one from the listings tab.
        </p>
      ) : null}
    </dl>
  );
}
