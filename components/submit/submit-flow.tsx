"use client";

import { useAction, useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Icon } from "@/components/icon";
import { ShipScorePanel } from "@/components/ship-score-panel";
import { IconTile } from "@/components/surface/icon-tile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type { ImportDraft } from "@/convex/submit";
import { AUTH_ENABLED, useSession } from "@/lib/session";
import { kindLabel } from "@/lib/links";
import { categoriesForSection, facetOptionLabel, sectionForKind } from "@/lib/taxonomy";
import type { Listing, ListingKind } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * SUBMIT
 * ======
 * One field, then a review.
 *
 * The first step reads the project rather than asking about it, so by the time
 * a person sees a form it is already filled with facts that came from GitHub
 * and npm. What they are left to supply is exactly the part a machine cannot
 * settle: which categories this belongs in, and how it is priced.
 *
 * The Ship Score panel is live from the moment the draft resolves. Showing the
 * grade — and the dimensions that came back N/A — before submission is the
 * whole difference between a directory that judges you and one that tells you
 * what it is judging.
 */
export function SubmitFlow(): ReactNode {
  // No deployment means no Convex provider in the tree, and Convex's own hooks
  // throw rather than idling — so the branch happens before any of them, on a
  // module constant that never changes for the life of the bundle.
  if (!AUTH_ENABLED) return <NoBackend />;
  return <LiveSubmitFlow />;
}

function LiveSubmitFlow(): ReactNode {
  const { isAuthenticated } = useSession();
  const inspect = useAction(api.submit.inspect);
  const create = useMutation(api.submit.create);
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ImportDraft | null>(null);

  const [kind, setKind] = useState<ListingKind>("library");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [pricing, setPricing] = useState("open-source");

  async function lookUp(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!url.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await inspect({ url });
      if ("error" in result) {
        setError(result.error);
        setDraft(null);
      } else {
        setDraft(result);
        setDescription(result.description);
        setCategories([]);
        setKind(result.npm ? "library" : "tool");
      }
    } catch {
      setError("The lookup failed. Try again, or paste the repo URL directly.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(): Promise<void> {
    if (!draft) return;
    setBusy(true);
    try {
      const created = await create({
        kind,
        name: draft.name,
        tagline: draft.tagline,
        description,
        categories,
        tags: draft.tags,
        ...(draft.homepage ? { homepage: draft.homepage } : {}),
        ...(draft.repo ? { repo: draft.repo } : {}),
        ...(draft.npm ? { npm: draft.npm } : {}),
        ...(draft.docs ? { docs: draft.docs } : {}),
        license: draft.license,
        licenseBucket: draft.licenseBucket,
        pricing,
        stack: draft.stack,
        facts: draft.facts,
        color: "#0066ff",
        monogram: draft.monogram,
      });
      toast.success("Submitted for review", {
        description: `${draft.name} is in the queue. You'll see it under your submissions.`,
      });
      router.push(`/me/submissions#${created.slug}`);
    } catch (thrown) {
      toast.error(thrown instanceof Error ? thrown.message : "Couldn't submit that");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[72rem] px-5 py-10 sm:px-8">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
          Submit
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-tight">
          Paste a link. We&apos;ll read the rest.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Every figure in the listing comes from GitHub and npm, not from a
          form. That is why there is nothing here to talk up — and why you can
          see the grade before you commit to it.
        </p>
      </header>

      <form onSubmit={lookUp} className="mt-8 flex max-w-2xl flex-wrap items-center gap-2">
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="github.com/owner/repo, npmjs.com/package/name, or a package name"
          className="min-w-64 flex-1 rounded-full"
          spellCheck={false}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="rounded-full"
          disabled={busy || !url.trim()}
        >
          {busy && !draft ? (
            <>
              <Icon name="loading" className="animate-spin" />
              Reading
            </>
          ) : (
            <>
              <Icon name="search" />
              Look it up
            </>
          )}
        </Button>
      </form>

      {error ? (
        <p className="mt-3 flex items-center gap-2 text-[13px] text-danger">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : null}

      {draft ? (
        <Draft
          draft={draft}
          description={description}
          setDescription={setDescription}
          kind={kind}
          setKind={setKind}
          categories={categories}
          setCategories={setCategories}
          pricing={pricing}
          setPricing={setPricing}
          onSubmit={submit}
          busy={busy}
          canSubmit={isAuthenticated}
        />
      ) : null}
    </div>
  );
}

function NoBackend(): ReactNode {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
      <h1 className="text-[22px] font-semibold tracking-tight">
        Submitting needs a backend
      </h1>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-muted-foreground">
        This deployment is running on the bundled catalogue. Point it at a
        Convex deployment and the importer, the review queue and accounts all
        come up together.
      </p>
      <Link
        href="/explore"
        className="mt-5 inline-flex items-center gap-1.5 text-[13px] text-accent hover:underline"
      >
        Back to the index
        <Icon name="forward" size={13} />
      </Link>
    </div>
  );
}

const KINDS: ListingKind[] = [
  "library",
  "tool",
  "resource",
  "mcp",
  "skill",
  "api",
  "repo",
];

const PRICING = ["open-source", "free", "freemium", "paid", "trial"];

function Draft({
  draft,
  description,
  setDescription,
  kind,
  setKind,
  categories,
  setCategories,
  pricing,
  setPricing,
  onSubmit,
  busy,
  canSubmit,
}: {
  draft: ImportDraft;
  description: string;
  setDescription: (value: string) => void;
  kind: ListingKind;
  setKind: (kind: ListingKind) => void;
  categories: string[];
  setCategories: (categories: string[]) => void;
  pricing: string;
  setPricing: (pricing: string) => void;
  onSubmit: () => Promise<void>;
  busy: boolean;
  canSubmit: boolean;
}): ReactNode {
  const section = sectionForKind(kind);
  const groups = useMemo(
    () => (section?.hasCategories ? categoriesForSection(section.id) : []),
    [section]
  );

  // The score panel takes a Listing, so the draft is projected into one. It is
  // the same computation the live page runs — no preview-only scoring path.
  const preview = useMemo<Listing>(
    () => ({
      _id: "preview",
      kind,
      slug: draft.slug,
      name: draft.name,
      tagline: draft.tagline,
      description,
      categories,
      tags: draft.tags,
      ...(draft.homepage ? { homepage: draft.homepage } : {}),
      ...(draft.repo ? { repo: draft.repo } : {}),
      ...(draft.npm ? { npm: draft.npm } : {}),
      ...(draft.docs ? { docs: draft.docs } : {}),
      license: draft.license,
      licenseBucket: draft.licenseBucket,
      pricing,
      stack: draft.stack,
      facts: draft.facts as Listing["facts"],
      componentCount: 0,
      color: "#0066ff",
      monogram: draft.monogram,
      featured: false,
      verified: false,
      status: "pending",
      // The preview is graded on facts, not on when this draft was made up.
      createdAt: 0,
      updatedAt: 0,
      views: 0,
      saves: 0,
      votes: 0,
    }),
    [draft, description, kind, categories, pricing]
  );

  function toggleCategory(id: string): void {
    setCategories(
      categories.includes(id)
        ? categories.filter((c) => c !== id)
        : categories.length >= 4
          ? categories
          : [...categories, id]
    );
  }

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <div className="flex items-start gap-3.5">
          <IconTile monogram={draft.monogram} color="#0066ff" size="lg" />
          <div className="min-w-0">
            <h2 className="text-[22px] font-semibold tracking-tight">{draft.name}</h2>
            <p className="mt-0.5 text-[14px] text-muted-foreground">
              {draft.tagline || "No description published"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {draft.repo ? <Badge variant="outline">GitHub</Badge> : null}
              {draft.npm ? <Badge variant="outline">npm · {draft.npm}</Badge> : null}
              <Badge variant="outline">{draft.license}</Badge>
              {draft.stack.typescript ? <Badge variant="outline">TypeScript</Badge> : null}
            </div>
          </div>
        </div>

        {draft.unresolved.length ? (
          <div className="mt-6 rounded-xl border border-border bg-surface p-4 dark:border-transparent">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
              What we couldn&apos;t confirm
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {draft.unresolved.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground"
                >
                  <Icon name="minus" size={13} className="mt-1 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[12px] leading-relaxed text-subtle-foreground">
              These stay empty rather than being filled in with something
              plausible. Fix them at the source and the listing updates on the
              next refresh.
            </p>
          </div>
        ) : null}

        <Field label="What is it" hint="Decides which part of the index it lives in">
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((option) => (
              <Chip key={option} active={kind === option} onClick={() => setKind(option)}>
                {kindLabel(option)}
              </Chip>
            ))}
          </div>
        </Field>

        <Field
          label="Categories"
          hint={`Up to four. ${categories.length} chosen.`}
        >
          {groups.length ? (
            <div className="flex flex-col gap-4">
              {groups.map((group) => (
                <div key={group.group.id}>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
                    {group.group.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <Chip
                        key={item.slug}
                        active={categories.includes(item.slug)}
                        onClick={() => toggleCategory(item.slug)}
                      >
                        {item.name}
                      </Chip>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              This section doesn&apos;t use categories.
            </p>
          )}
        </Field>

        <Field label="Pricing" hint="The only claim we can't check for you">
          <div className="flex flex-wrap gap-1.5">
            {PRICING.map((option) => (
              <Chip
                key={option}
                active={pricing === option}
                onClick={() => setPricing(option)}
              >
                {facetOptionLabel("pricing", option)}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Description" hint="Pulled from the repo — edit if it reads badly">
          <Textarea
            value={description}
            rows={4}
            onChange={(event) => setDescription(event.target.value)}
            className="rounded-xl"
          />
        </Field>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            size="lg"
            className="rounded-full"
            disabled={busy || !categories.length || !canSubmit}
            onClick={() => void onSubmit()}
          >
            {busy ? <Icon name="loading" className="animate-spin" /> : <Icon name="submit" />}
            Submit for review
          </Button>
          {!canSubmit ? (
            <p className="text-[13px] text-muted-foreground">
              <Link href="/signin?next=/submit" className="text-accent hover:underline">
                Sign in
              </Link>{" "}
              to send this to the queue — the lookup above works either way.
            </p>
          ) : !categories.length ? (
            <p className="text-[13px] text-muted-foreground">
              Pick at least one category.
            </p>
          ) : null}
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <h2 className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-subtle-foreground">
          Your Ship Score, before you submit
        </h2>
        <ShipScorePanel listing={preview} />
        <p className="mt-2.5 text-[12px] leading-relaxed text-subtle-foreground">
          Computed from what we just read, by the same code that grades every
          live listing. Dimensions marked N/A aren&apos;t counted against you —
          they simply leave the score standing on less.
        </p>
      </aside>
    </div>
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
    <section className="mt-8">
      <div className="mb-2.5 flex items-baseline gap-2">
        <h3 className="text-[13px] font-semibold tracking-tight">{label}</h3>
        {hint ? <p className="text-[12px] text-subtle-foreground">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}): ReactNode {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "t-press rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
        active
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
