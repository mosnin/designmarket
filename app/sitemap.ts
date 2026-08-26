import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getComponents, getListings, getStacks } from "@/lib/data";
import { listingHref } from "@/lib/links";
import { categories, sections } from "@/lib/taxonomy";

/**
 * The sitemap is generated from the catalogue rather than maintained by hand,
 * so a section added to the taxonomy is crawlable the same day it ships.
 *
 * `lastModified` comes from each row's own `updatedAt` — a crawler that is
 * told everything changed today learns to stop believing the field.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const [listings, components, stacks] = await Promise.all([
    getListings({ limit: 2000 }),
    getComponents({ limit: 2000 }),
    getStacks(200),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/explore`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/components`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/compare`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/drop`, changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/mcp-connect`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/submit`, changeFrequency: "monthly", priority: 0.4 },
  ];

  return [
    ...staticPages,
    ...sections
      .filter((section) => section.hasCategories)
      .map((section) => ({
        url: `${base}${section.href}`,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ...categories.map((category) => ({
      url: `${base}/c/${category.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...listings.items.map((listing) => ({
      url: `${base}${listingHref(listing)}`,
      lastModified: new Date(listing.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...components.items.map((component) => ({
      url: `${base}/components/${component.slug}`,
      lastModified: new Date(component.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...stacks.map((stack) => ({
      url: `${base}/stacks/${stack.slug}`,
      lastModified: new Date(stack.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
