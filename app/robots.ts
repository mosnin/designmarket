import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is secret — these are just pages that mean nothing to a
        // crawler: a signed-out visitor sees an empty shell, and the preview
        // frames are component sandboxes with no page of their own.
        disallow: ["/me/", "/admin", "/admin/", "/preview/", "/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
