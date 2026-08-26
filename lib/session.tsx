"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { createContext, useContext, type ReactNode } from "react";
import { api } from "@/convex/_generated/api";
import type { Viewer } from "@/convex/profiles";

/**
 * SESSION
 * =======
 * The app is designed to be fully browsable logged out — and to boot at all
 * with no Convex deployment configured. So the session is read through one
 * context that reports three states rather than two: signed in, signed out,
 * and "accounts aren't available on this deployment".
 *
 * The branch on `AUTH_ENABLED` happens at the provider, not inside a hook, so
 * hook order never changes between renders.
 */

export const AUTH_ENABLED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

type SignIn = ReturnType<typeof useAuthActions>["signIn"];
type SignOut = ReturnType<typeof useAuthActions>["signOut"];

export type Session = {
  /** false when no Convex deployment is configured */
  authEnabled: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  viewer: Viewer | null;
  isStaff: boolean;
  isPro: boolean;
  /** null when accounts are unavailable, so callers can render a clear state */
  signIn: SignIn | null;
  signOut: SignOut | null;
};

const OFFLINE_SESSION: Session = {
  authEnabled: false,
  isLoading: false,
  isAuthenticated: false,
  viewer: null,
  isStaff: false,
  isPro: false,
  signIn: null,
  signOut: null,
};

const SessionContext = createContext<Session>(OFFLINE_SESSION);

function LiveSession({ children }: { children: ReactNode }): ReactNode {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const viewer = useQuery(api.profiles.viewer, isAuthenticated ? {} : "skip");

  const value: Session = {
    signIn,
    signOut,
    authEnabled: true,
    // The profile row is written in the same transaction as the account, but
    // the query still resolves a beat after `isAuthenticated` flips.
    isLoading: isLoading || (isAuthenticated && viewer === undefined),
    isAuthenticated,
    viewer: viewer ?? null,
    isStaff: viewer?.role === "admin" || viewer?.role === "moderator",
    isPro: viewer?.plan === "pro",
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function SessionProvider({ children }: { children: ReactNode }): ReactNode {
  if (!AUTH_ENABLED) {
    return (
      <SessionContext.Provider value={OFFLINE_SESSION}>
        {children}
      </SessionContext.Provider>
    );
  }
  return <LiveSession>{children}</LiveSession>;
}

export function useSession(): Session {
  return useContext(SessionContext);
}

/**
 * Sign-in and sign-out come off the session rather than from `useAuthActions`
 * directly, so components can call them without caring whether a Convex
 * deployment exists — they are simply null when accounts are unavailable.
 */
export function useAuth(): Pick<Session, "signIn" | "signOut"> {
  const { signIn, signOut } = useSession();
  return { signIn, signOut };
}
