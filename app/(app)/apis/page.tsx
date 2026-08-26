import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionBrowse } from "@/components/browse/section-browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "APIs",
  description: "Public APIs worth wiring up, with the auth model and pricing up front.",
  path: "/apis",
});

export default async function ApisPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  return (
    <SectionBrowse
      sectionId="apis"
      searchParams={await searchParams}
      noun="API"
    />
  );
}
