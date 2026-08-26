import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookmarkList } from "@/components/me/bookmark-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your bookmarks",
  path: "/me/bookmarks",
});

export default function BookmarksPage(): ReactNode {
  return <BookmarkList />;
}
