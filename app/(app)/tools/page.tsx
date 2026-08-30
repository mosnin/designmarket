import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionBrowse } from "@/components/browse/section-browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "Tools",
  description:
    "AI and software tools, graded on evidence rather than upvotes.",
  path: "/tools",
});

export default async function ToolsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  return (
    <SectionBrowse
      sectionId="tools"
      searchParams={await searchParams}
      noun="tool"
      description="Everything from AI agents to the boring parts of the stack. Same grading as the rest of the catalogue: licence, maintenance, adoption and docs, with the dimensions that cannot apply to a hosted product marked N/A rather than scored zero."
    />
  );
}
