import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { getCategoryCounts } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const counts = await getCategoryCounts();
  return (
    <>
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <AppShell counts={counts}>{children}</AppShell>
    </>
  );
}
