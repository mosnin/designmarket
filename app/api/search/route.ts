import { NextResponse, type NextRequest } from "next/server";
import { getComponents, getListings } from "@/lib/data";
import { listingHref } from "@/lib/links";
import { categories } from "@/lib/taxonomy";

/**
 * Search for the ⌘K palette.
 *
 * A route handler rather than a direct Convex call from the client, so the
 * palette works identically whether or not a deployment is configured — it
 * goes through the same data layer as every page.
 */
export const dynamic = "force-dynamic";

export type SearchHit = {
  type: "component" | "library" | "tool" | "category";
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
  live?: boolean;
  color?: string;
  monogram?: string;
};

export async function GET(request: NextRequest): Promise<NextResponse> {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 1) {
    return NextResponse.json({ hits: [] satisfies SearchHit[] });
  }

  const [components, listings] = await Promise.all([
    getComponents({ q, limit: 6 }),
    getListings({ q, limit: 6 }),
  ]);

  const listingBySlug = new Map(listings.items.map((l) => [l.slug, l]));

  const hits: SearchHit[] = [
    ...components.items.map((c) => {
      const parent = listingBySlug.get(c.listingSlug);
      return {
        type: "component" as const,
        slug: c.slug,
        title: c.name,
        subtitle: c.description,
        href: `/components/${c.slug}`,
        meta: parent?.name ?? c.listingSlug,
        live: c.previewMode !== "static",
        ...(parent?.color ? { color: parent.color } : {}),
        ...(parent?.monogram ? { monogram: parent.monogram } : {}),
      };
    }),
    ...listings.items.map((l) => ({
      type: l.kind === "library" ? ("library" as const) : ("tool" as const),
      slug: l.slug,
      title: l.name,
      subtitle: l.tagline,
      href: listingHref(l),
      meta: l.componentCount ? `${l.componentCount} components` : l.license,
      color: l.color,
      monogram: l.monogram,
    })),
    ...categories
      .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 4)
      .map((c) => ({
        type: "category" as const,
        slug: c.slug,
        title: c.name,
        subtitle: c.blurb,
        href: `/c/${c.slug}`,
      })),
  ];

  return NextResponse.json({ hits });
}
