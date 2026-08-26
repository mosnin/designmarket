"use client";

import { Icon } from "@/components/icon";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { GithubMark } from "@/components/brand/github-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ENABLED, useAuth } from "@/lib/session";

type Mode = "signIn" | "signUp";

const copy = {
  signIn: {
    title: "Welcome back",
    blurb: "Sign in to reach your bookmarks, boards and submissions.",
    submit: "Sign in",
    switchPrompt: "New here?",
    switchLabel: "Create an account",
    switchHref: "/signup",
  },
  signUp: {
    title: "Create an account",
    blurb:
      "Free forever. Bookmark anything, build boards, remix components and submit your own work.",
    submit: "Create account",
    switchPrompt: "Already have an account?",
    switchLabel: "Sign in",
    switchHref: "/signin",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }): ReactNode {
  const { signIn } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/";
  const [pending, setPending] = useState<"password" | "github" | null>(null);
  const text = copy[mode];

  if (!AUTH_ENABLED) {
    return (
      <div className="rounded-md border border-border bg-muted p-4 text-[13px] leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Accounts aren&apos;t available yet</p>
        <p className="mt-1">
          This deployment has no Convex backend configured, so browsing works but
          sign-in doesn&apos;t. Run{" "}
          <code className="rounded-xs bg-muted/50 px-1 py-0.5 font-mono text-xs">
            npx convex dev
          </code>{" "}
          and set <code className="font-mono text-xs">NEXT_PUBLIC_CONVEX_URL</code>.
        </p>
        <Button variant="outline" size="sm" className="mt-3" asChild>
          <Link href="/explore">Keep browsing</Link>
        </Button>
      </div>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!signIn) return;
    const formData = new FormData(event.currentTarget);
    formData.set("flow", mode);
    setPending("password");
    try {
      await signIn("password", formData);
      router.push(next);
    } catch (error) {
      const message =
        mode === "signUp"
          ? "Could not create that account. The email may already be registered, or the password is too short."
          : "That email and password combination didn't work.";
      toast.error(message);
      console.error(error);
    } finally {
      setPending(null);
    }
  }

  async function onGitHub(): Promise<void> {
    if (!signIn) return;
    setPending("github");
    try {
      await signIn("github", { redirectTo: next });
    } catch (error) {
      toast.error("GitHub sign-in is not configured on this deployment.");
      console.error(error);
      setPending(null);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-medium">{text.title}</h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
        {text.blurb}
      </p>

      <Button
        variant="secondary"
        size="lg"
        className="mt-6 w-full"
        onClick={onGitHub}
        disabled={pending !== null}
      >
        {pending === "github" ? (
          <Icon name="loading" className="animate-spin" />
        ) : (
          <GithubMark />
        )}
        Continue with GitHub
      </Button>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[11px] uppercase tracking-wider text-foreground/50">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        {mode === "signUp" ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium">Name</span>
            <Input name="name" autoComplete="name" placeholder="Ada Lovelace" />
          </label>
        ) : null}

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Email</span>
          <Input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Password</span>
          <Input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            placeholder={mode === "signUp" ? "At least 8 characters" : "••••••••"}
          />
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="mt-2 w-full"
          disabled={pending !== null}
        >
          {pending === "password" ? <Icon name="loading" className="animate-spin" /> : null}
          {text.submit}
          {pending === "password" ? null : <Icon name="forward" />}
        </Button>
      </form>

      <p className="mt-5 text-[13px] text-muted-foreground">
        {text.switchPrompt}{" "}
        <Link
          href={text.switchHref}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {text.switchLabel}
        </Link>
      </p>
    </div>
  );
}
