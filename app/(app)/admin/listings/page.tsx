import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminListingTable } from "@/components/admin/listing-table";

export const metadata: Metadata = { title: "Listings · Admin", robots: { index: false } };

export default function AdminListingsPage(): ReactNode {
  return <AdminListingTable />;
}
