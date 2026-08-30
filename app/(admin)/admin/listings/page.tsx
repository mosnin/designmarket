import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminListingTable } from "@/components/admin/listing-table";

export const metadata: Metadata = { title: "Listings · Admin", robots: { index: false } };

export default function AdminListingsPage(): ReactNode {
  return (
    <>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-medium">Listings</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The whole index. Status, featured and verified are decisions a person
          makes; nothing that gets fetched is editable here.
        </p>
      </header>
      <AdminListingTable />
    </>
  );
}
