import type { Metadata } from "next";
import { siteConfig } from "./config";

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "ui components",
    "component library",
    "design system",
    "ai tools",
    "open source ui",
    "react components",
    "tailwind components",
    "mcp server",
    "shadcn",
  ],
  openGraph: {
    type: "website",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  const url = path ? new URL(path, siteConfig.url).toString() : siteConfig.url;
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url,
      siteName: siteConfig.name,
    },
  };
}
