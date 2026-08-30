import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to Vitrine to reach your bookmarks, boards and submissions.",
  path: "/signin",
});

export default function SignInPage(): ReactNode {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signIn" />
    </Suspense>
  );
}
