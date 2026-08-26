"use client";

import { Icon } from "@/components/icon";

import { useMutation } from "convex/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/session";
import { useThemeMorph } from "@/lib/theme-morph";

/**
 * Saving a remix stores the props you landed on and the tokens you were
 * viewing them in — your decision, not a copy of someone else's code. The
 * remix keeps pointing at the original component so it stays credited and
 * stays current when the library ships a new version.
 */
export function SaveRemix({
  componentSlug,
  componentName,
  props,
}: {
  componentSlug: string;
  componentName: string;
  props: Record<string, unknown>;
}): ReactNode {
  const { authEnabled, isAuthenticated } = useSession();
  const { tokens, presetId } = useThemeMorph();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(`${componentName} — my version`);
  const [saving, setSaving] = useState(false);

  if (!authEnabled) return null;

  if (!isAuthenticated) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/signin?next=/components/${componentSlug}`}>
          <Icon name="bookmark" />
          Save this setup
        </Link>
      </Button>
    );
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Icon name="bookmark" />
        Save this setup
      </Button>
      <RemixDialog
        open={open}
        onOpenChange={setOpen}
        name={name}
        setName={setName}
        saving={saving}
        setSaving={setSaving}
        componentSlug={componentSlug}
        props={props}
        tokens={{ ...tokens, presetId }}
      />
    </>
  );
}

function RemixDialog({
  open,
  onOpenChange,
  name,
  setName,
  saving,
  setSaving,
  componentSlug,
  props,
  tokens,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
  componentSlug: string;
  props: Record<string, unknown>;
  tokens: unknown;
}): ReactNode {
  const save = useMutation(api.remixes.save);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save this setup</DialogTitle>
          <DialogDescription>
            Stores the props you landed on and the tokens you were viewing them
            in. It keeps pointing at the original component, so it stays current.
          </DialogDescription>
        </DialogHeader>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Name</span>
          <Input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <pre className="max-h-32 overflow-auto scrollbar-thin rounded-sm border border-border bg-muted p-2.5 font-mono text-[11px] text-muted-foreground">
          {JSON.stringify(props, null, 2)}
        </pre>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                const result = await save({
                  componentSlug,
                  name,
                  props,
                  tokens,
                });
                toast.success(result.updated ? "Remix updated" : "Remix saved", {
                  description: "Find it under Remixes in your account.",
                });
                onOpenChange(false);
              } catch (error) {
                toast.error("Could not save that remix");
                console.error(error);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? <Icon name="loading" className="animate-spin" /> : null}
            Save remix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
