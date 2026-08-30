import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SectionBrowse } from "@/components/browse/section-browse";
import { pageMetadata } from "@/lib/metadata";
import type { SearchParamsInput } from "@/lib/search-params";

export const metadata: Metadata = pageMetadata({
  title: "MCP Servers",
  description: "Tools your agent can pick up, with transport, auth and exposed tools spelled out.",
  path: "/mcp",
});

export default async function McpPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsInput>;
}): Promise<ReactNode> {
  return (
    <SectionBrowse
      sectionId="mcp"
      searchParams={await searchParams}
      noun="server"
    />
  );
}
