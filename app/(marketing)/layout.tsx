import type { ReactNode } from "react";
import { Footer } from "@/components/theme/footer";
import { MarketingHeader } from "@/components/theme/marketing-header";
import { SmoothScroll } from "@/components/theme/smooth-scroll";
import { features } from "@/lib/config";

/**
 * The marketing shell — no sidebar, no section rail, no category counts.
 *
 * The landing page used to render inside the app shell, which put a hero and a
 * fixed navigation sidebar on screen at the same time. Smooth scrolling lives
 * here too, and only here: hijacking the scroll inside the app fights the
 * sidebar and the preview frames.
 */
export default function MarketingLayout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <a href="#main" className="skip-to-content">
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main" className="flex min-h-dvh flex-col pt-16">
        {features.smoothScroll ? <SmoothScroll>{children}</SmoothScroll> : children}
      </main>
      <Footer />
    </>
  );
}
