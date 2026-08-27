import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminQueue } from "@/components/admin/queue";

export const metadata: Metadata = { title: "Queue · Admin", robots: { index: false } };

export default function AdminPage(): ReactNode {
  return (
    <>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-medium">Review queue</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Submissions waiting on a decision. Every row leads with the links that
          answer whether a listing is what it claims to be.
        </p>
      </header>
      <AdminQueue />
    </>
  );
}
