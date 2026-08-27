import type { Metadata } from "next";
import { siteConfig } from "./config";

const OG_IMAGE = "/opengraph-image";

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
    // Referenced by path rather than left to the opengraph-image file
    // convention. Declaring `openGraph` explicitly in a segment suppresses the
    // automatic merge, so the generated card was never reaching the document —
    // while `twitter:card` went on promising a large image that did not exist.
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: siteConfig.tagline }],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [OG_IMAGE],
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
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: title }],
    },
    // Twitter does not fall back to openGraph when a `twitter` block exists
    // anywhere in the tree, and the root layout defines one. Without this the
    // card for every page in the app quoted the site's own homepage title.
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
      images: [OG_IMAGE],
    },
  };
}
