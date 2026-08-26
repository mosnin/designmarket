import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * The sandbox has no app chrome — no sidebar, no topbar, no theme toggle. It
 * is a bare document that exists to be embedded in an iframe from our own
 * origin (enforced by the frame-ancestors header in next.config.ts).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return children;
}
