import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BoardList } from "@/components/me/board-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Your boards",
  path: "/me/boards",
});

export default function BoardsPage(): ReactNode {
  return <BoardList />;
}
