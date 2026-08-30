import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Create an account",
  description:
    "Free forever. Bookmark anything, build boards, remix components and submit your own work.",
  path: "/signup",
});

export default function SignUpPage(): ReactNode {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signUp" />
    </Suspense>
  );
}
