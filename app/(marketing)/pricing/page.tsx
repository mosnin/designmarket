import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Pricing } from "@/components/pricing/pricing";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Pricing",
  description:
    "The catalogue is free and works logged out. $9/mo adds the MCP server, API keys and the compatibility API — machine access, not a paywall on reading.",
  path: "/pricing",
});

export default function PricingPage(): ReactNode {
  return <Pricing />;
}
