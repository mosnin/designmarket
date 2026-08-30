import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Settings } from "@/components/me/settings";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Settings",
  path: "/me/settings",
});

export default function SettingsPage(): ReactNode {
  return <Settings />;
}
