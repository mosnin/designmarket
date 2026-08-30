import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminMemberTable } from "@/components/admin/member-table";
import { getViewer } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Members · Admin", robots: { index: false } };

export default async function AdminMembersPage(): Promise<ReactNode> {
  const viewer = await getViewer();
  return (
    <>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-medium">Members</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Roles and plans. A moderator decides what gets into the index; an
          admin decides who gets to decide.
        </p>
      </header>
      <AdminMemberTable role={viewer?.role ?? "member"} />
    </>
  );
}
