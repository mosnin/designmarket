import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminMemberTable } from "@/components/admin/member-table";
import { getViewer } from "@/lib/auth-server";

export const metadata: Metadata = { title: "Members · Admin", robots: { index: false } };

export default async function AdminMembersPage(): Promise<ReactNode> {
  const viewer = await getViewer();
  return <AdminMemberTable role={viewer?.role ?? "member"} />;
}
