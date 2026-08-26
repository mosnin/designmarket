import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionBrowse } from "@/components/browse/section-browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "Skills",
  description: "Packaged instructions that teach an agent to do one job properly.",
  path: "/skills",
});

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  return (
    <SectionBrowse
      sectionId="skills"
      searchParams={await searchParams}
      noun="skill"
    />
  );
}
