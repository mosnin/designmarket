import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RemixList } from "@/components/me/remix-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your remixes",
  path: "/me/remixes",
});

export default function RemixesPage(): ReactNode {
  return <RemixList />;
}
