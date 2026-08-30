import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionBrowse } from "@/components/browse/section-browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "UI & Design",
  description: "Component libraries and design systems, with every component rendered live.",
  path: "/ui",
});

export default async function UiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  return (
    <SectionBrowse
      sectionId="ui"
      searchParams={await searchParams}
      noun="library"
    />
  );
}
