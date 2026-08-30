import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SubmitFlow } from "@/components/submit/submit-flow";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Submit a listing",
  description:
    "Paste a GitHub repo or an npm package. We read it, grade it, and show you the Ship Score before you submit.",
  path: "/submit",
});

export default function SubmitPage(): ReactNode {
  return <SubmitFlow />;
}
