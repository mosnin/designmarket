import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionBrowse } from "@/components/browse/section-browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "Repositories",
  description: "Open-source repositories worth reading, cloning or stealing from.",
  path: "/repos",
});

export default async function ReposPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  return (
    <SectionBrowse
      sectionId="repos"
      searchParams={await searchParams}
      noun="repository"
    />
  );
}
