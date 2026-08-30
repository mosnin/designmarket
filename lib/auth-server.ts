import "server-only";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Viewer } from "@/convex/profiles";

/**
 * Server-side session reads, for gating pages before they render rather than
 * flashing content and then hiding it.
 *
 * Middleware already bounces signed-out users away from `/me`, `/submit` and
 * `/admin`. These helpers are the second lock: middleware knows whether you
 * are signed in, but only the database knows whether you are staff.
 */

export const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function getViewer(): Promise<Viewer | null> {
  if (!AUTH_ENABLED) return null;
  try {
    const token = await convexAuthNextjsToken();
    if (!token) return null;
    return await fetchQuery(api.profiles.viewer, {}, { token });
  } catch (error) {
    console.warn("[auth] could not read the session", error);
    return null;
  }
}

export async function requireViewer(nextPath: string): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect(`/signin?next=${encodeURIComponent(nextPath)}`);
  return viewer;
}

/** Moderators and admins. Anyone else gets a 404 rather than a 403 — there is
 *  no reason to confirm that an admin area exists to someone who can't use it. */
export async function requireStaff(nextPath: string): Promise<Viewer> {
  const viewer = await requireViewer(nextPath);
  if (viewer.role !== "admin" && viewer.role !== "moderator") {
    redirect("/");
  }
  return viewer;
}

export function isStaff(viewer: Viewer | null): boolean {
  return viewer?.role === "admin" || viewer?.role === "moderator";
}
