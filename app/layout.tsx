import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Providers } from "@/components/providers";
import { SessionProvider } from "@/lib/session";
import { ThemeMorphProvider } from "@/lib/theme-morph";
import { baseMetadata } from "@/lib/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbf9" },
    { media: "(prefers-color-scheme: dark)", color: "#08080b" },
  ],
  width: "device-width",
  initialScale: 1,
};

const authConfigured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

function Document({ children }: { children: ReactNode }): ReactNode {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans`}
      >
        <a href="#main" className="skip-to-content">
          Skip to content
        </a>
        <ConvexClientProvider>
          <SessionProvider>
            <Providers>
              <ThemeMorphProvider>{children}</ThemeMorphProvider>
            </Providers>
          </SessionProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactNode {
  // The server provider reads the auth cookie, which only exists when there is
  // a deployment to read it against.
  if (!authConfigured) return <Document>{children}</Document>;
  return (
    <ConvexAuthNextjsServerProvider>
      <Document>{children}</Document>
    </ConvexAuthNextjsServerProvider>
  );
}
