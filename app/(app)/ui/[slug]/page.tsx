import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ListingDetail, listingMetadata } from "@/components/listing/listing-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return listingMetadata((await params).slug);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactNode> {
  return <ListingDetail slug={(await params).slug} />;
}
