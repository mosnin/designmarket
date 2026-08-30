import { notFound, permanentRedirect } from "next/navigation";
import { getListing } from "@/lib/data";
import { sectionForKind } from "@/lib/taxonomy";

/**
 * Kept so older links keep working: a listing's canonical home is
 * `/<section>/<slug>`, and this sends you there.
 */
export default async function LegacyListingRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<never> {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();
  const section = sectionForKind(listing.kind);
  permanentRedirect(`${section?.href ?? "/explore"}/${slug}`);
}
