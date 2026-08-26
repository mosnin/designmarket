"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PRO_PRICE_USD } from "@/lib/config";
import { useSession } from "@/lib/session";
import { formatDate, timeAgo } from "@/lib/utils";

export function Settings(): ReactNode {
  return (
    <div className="flex flex-col gap-12">
      <ProfileForm />
      <ApiKeys />
    </div>
  );
}

function ProfileForm(): ReactNode {
  const { viewer } = useSession();
  const update = useMutation(api.profiles.updateProfile);
  const [busy, setBusy] = useState(false);

  if (!viewer) return <Skeleton className="h-40 w-full rounded-sm" />;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await update({
        displayName: String(form.get("displayName") ?? ""),
        handle: String(form.get("handle") ?? ""),
        bio: String(form.get("bio") ?? ""),
        website: String(form.get("website") ?? ""),
      });
      toast.success("Saved");
    } catch (thrown) {
      toast.error(thrown instanceof Error ? thrown.message : "Couldn't save that");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
        Profile
      </h2>
      <form onSubmit={submit} className="mt-4 flex max-w-xl flex-col gap-4">
        <Field label="Display name">
          <Input name="displayName" defaultValue={viewer.displayName} maxLength={60} />
        </Field>
        <Field label="Handle" hint="Your profile lives at /u/handle">
          <Input name="handle" defaultValue={viewer.handle} maxLength={24} />
        </Field>
        <Field label="Bio">
          <Textarea name="bio" defaultValue={viewer.bio ?? ""} rows={3} maxLength={280} />
        </Field>
        <Field label="Website">
          <Input
            name="website"
            type="url"
            defaultValue={viewer.website ?? ""}
            placeholder="https://"
          />
        </Field>
        <div>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="rounded-full"
            disabled={busy}
          >
            Save changes
          </Button>
        </div>
      </form>
    </section>
  );
}

/**
 * A key is shown once, here, and never again — we store only its SHA-256, so
 * there is no "reveal" button to build and no support flow that can recover
 * one. The copy panel stays open until it's dismissed, because a key that
 * disappears on a stray click is a key someone has to revoke and recreate.
 */
function ApiKeys(): ReactNode {
  const { isPro } = useSession();
  const billing = useQuery(api.stripe.configured, {});
  const checkout = useAction(api.stripe.checkout);
  const keys = useQuery(api.apiKeys.mine, {});
  const create = useAction(api.apiKeys.create);
  const revoke = useMutation(api.apiKeys.revoke);
  const [fresh, setFresh] = useState<{ key: string; label: string } | null>(null);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  async function mint(event: FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    try {
      const created = await create({ label: label.trim() || "Agent key" });
      setFresh({ key: created.key, label: created.label });
      setLabel("");
    } catch (thrown) {
      toast.error(thrown instanceof Error ? thrown.message : "Couldn't create a key");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-foreground/40">
          API keys
        </h2>
        <Link href="/mcp-connect" className="text-[12px] text-foreground/70 hover:text-foreground">
          How to connect the MCP server
        </Link>
      </div>

      {!isPro ? (
        <div className="mt-4 max-w-xl rounded-sm border border-border p-5">
          <p className="font-serif text-lg font-medium">Keys are part of the Pro plan</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Everything you can read here stays free. A key is what lets an agent
            read it for you, a thousand times a day, without a browser.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {billing?.billing ? (
              <Button
                variant="primary"
                size="sm"
                className="rounded-full"
                onClick={async () => {
                  const result = await checkout({ returnTo: "/me/settings" });
                  if ("url" in result) window.location.href = result.url;
                  else toast.error(result.error);
                }}
              >
                Upgrade — ${PRO_PRICE_USD}/mo
              </Button>
            ) : null}
            <Button variant="outline" size="sm" className="rounded-full" asChild>
              <Link href="/pricing">See what Pro adds</Link>
            </Button>
          </div>
          {billing && !billing.billing ? (
            <p className="mt-3 text-[12px] leading-relaxed text-foreground/50">
              Checkout isn&apos;t configured on this deployment. An admin can
              grant Pro directly from the members table.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          {fresh ? (
            <div className="mt-4 max-w-2xl rounded-sm border border-foreground/25 p-4">
              <p className="text-[13px] font-medium text-foreground">
                Copy {fresh.label} now — this is the only time it&apos;s shown
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-md border border-border py-2 pl-3 pr-2">
                <code className="min-w-0 flex-1 overflow-x-auto scrollbar-none whitespace-nowrap font-mono text-[12px]">
                  {fresh.key}
                </code>
                <CopyButton value={fresh.key} size="icon" label="Copy API key" />
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground/50">
                We store a hash, not the key. If you lose it, revoke it and make
                another — there is no way for us to show it again.
              </p>
              <Button
                variant="ghost"
                size="xs"
                className="mt-2 rounded-full"
                onClick={() => setFresh(null)}
              >
                I&apos;ve saved it
              </Button>
            </div>
          ) : null}

          <form onSubmit={mint} className="mt-4 flex max-w-xl items-center gap-2">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="What's it for — “Claude Code on my laptop”"
              maxLength={60}
              className="rounded-full"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="shrink-0 rounded-full"
              disabled={busy}
            >
              <Icon name="plus" size={14} />
              New key
            </Button>
          </form>

          {keys === undefined ? (
            <Skeleton className="mt-4 h-24 w-full rounded-sm" />
          ) : keys.length === 0 ? (
            <p className="mt-4 text-[13px] text-muted-foreground">
              No keys yet.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-foreground/10 border-y border-border">
              {keys.map((key) => (
                <li key={key.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium">
                      {key.label}
                      {key.revokedAt ? (
                        <span className="ml-2 text-[12px] font-normal text-danger">
                          revoked {timeAgo(key.revokedAt)}
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 font-mono text-[11.5px] text-foreground/50">
                      {key.prefix}…{"  ·  "}
                      {key.callCount} {key.callCount === 1 ? "call" : "calls"}
                      {"  ·  "}
                      {key.lastUsedAt
                        ? `last used ${timeAgo(key.lastUsedAt)}`
                        : "never used"}
                      {"  ·  "}created {formatDate(key.createdAt)}
                    </p>
                  </div>
                  {key.revokedAt ? null : (
                    <Button
                      variant="ghost"
                      size="xs"
                      className="rounded-full text-danger"
                      onClick={async () => {
                        await revoke({ id: key.id as Id<"apiKeys"> });
                        toast("Revoked — any agent using it stops now");
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[12px] leading-relaxed text-foreground/50">
            Revoked keys stay listed. The row is what proves a key existed and
            what it did — the usage count is the only way to tell a leaked key
            from an unused one after the fact.
          </p>
        </>
      )}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}): ReactNode {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2">
        <span className="text-[13px] font-medium">{label}</span>
        {hint ? <span className="text-[12px] text-foreground/50">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}
