import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SubmissionList } from "@/components/me/submission-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your submissions",
  path: "/me/submissions",
});

export default function SubmissionsPage(): ReactNode {
  return <SubmissionList />;
}
