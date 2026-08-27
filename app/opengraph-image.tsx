import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card that shows up when a link is pasted anywhere.
 *
 * `twitter:card` was already declared `summary_large_image`, which promises an
 * image — and there wasn't one, so every share rendered a blank or degraded
 * card. This is the theme's palette and geometry rather than a screenshot: the
 * off-white ground, the near-black mark, one hairline.
 *
 * No web font is fetched. Pulling one at render time makes the card depend on
 * a network call that can fail silently on a cold serverless invocation, and
 * an OG image that intermittently 500s is worse than one set in the default
 * face.
 */
export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fafaf8",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fafaf8" }} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 600, color: "#0a0a0a" }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#0a0a0a",
              maxWidth: 940,
            }}
          >
            Every component, running.
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#737373", maxWidth: 900 }}>
            Live previews, install plans, and an index your coding agent can read.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ height: 1, flex: 1, background: "#e5e5e5" }} />
          <div style={{ fontSize: 24, color: "#737373" }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    size
  );
}
