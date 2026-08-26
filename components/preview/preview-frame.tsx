"use client";

import { useTheme } from "next-themes";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PREVIEW_MESSAGE,
  type PreviewMessage,
  type PreviewState,
} from "@/lib/preview-protocol";
import { keyToSlug } from "@/lib/registry-manifest";
import { useThemeMorph } from "@/lib/theme-morph";
import { cn } from "@/lib/utils";

/**
 * THE RENDER LAYER, host side.
 *
 * An iframe on our own origin — not a screenshot, not a video, not a shadow
 * DOM hack. A real document means the component gets its own stacking context,
 * its own `document`, and its own media queries, so a portal, a scroll lock or
 * a container query behaves exactly as it would in the viewer's app.
 *
 * The frame is mounted lazily. A grid of live components would otherwise be a
 * grid of documents, and the point of a marketplace is that you can scroll it.
 */
export function PreviewFrame({
  registryKey,
  props,
  height = 260,
  lazy = true,
  className,
  onError,
}: {
  registryKey: string;
  props: Record<string, unknown>;
  height?: number;
  lazy?: boolean;
  className?: string;
  onError?: (message: string) => void;
}): ReactNode {
  const { tokens } = useThemeMorph();
  const { resolvedTheme } = useTheme();
  const scheme: "light" | "dark" = resolvedTheme === "dark" ? "dark" : "light";

  const containerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [visible, setVisible] = useState(!lazy);
  const [ready, setReady] = useState(false);
  const [measured, setMeasured] = useState<number | null>(null);

  // Mount the document only once it is close to the viewport.
  useEffect(() => {
    if (!lazy || visible) return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy, visible]);

  const push = useCallback(() => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    const message: PreviewState = {
      type: PREVIEW_MESSAGE.state,
      props,
      tokens: scheme === "dark" ? tokens.dark : tokens.light,
      scheme,
    };
    frame.contentWindow.postMessage(message, window.location.origin);
  }, [props, tokens, scheme]);

  // Listen for the frame's handshake and height reports.
  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frameRef.current?.contentWindow) return;
      const data = event.data as PreviewMessage | undefined;
      if (!data?.type?.startsWith?.("vitrine:preview:")) return;

      // Any message at all means the document is alive and listening.
      setReady(true);

      if (data.type === PREVIEW_MESSAGE.ready) push();
      else if (data.type === PREVIEW_MESSAGE.height) setMeasured(data.height);
      else if (data.type === PREVIEW_MESSAGE.error) onError?.(data.message);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [push, onError]);

  // Re-push whenever props, tokens or the colour scheme change.
  useEffect(() => {
    if (ready) push();
  }, [ready, push]);

  const src = `/preview/${keyToSlug(registryKey)}?scheme=${scheme}`;
  const frameHeight = Math.max(height, measured ?? 0);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height: frameHeight }}
    >
      {visible ? (
        <iframe
          ref={frameRef}
          src={src}
          title="Live component preview"
          loading="lazy"
          /* Scripts yes, same-origin yes (it is our document and needs the
             fonts and stylesheet); no top navigation, no forms, no popups. */
          sandbox="allow-scripts allow-same-origin"
          onLoad={() => {
            // Safety net: if the handshake is missed, the load event still
            // proves the document exists, and pushing state is idempotent.
            setReady(true);
            push();
          }}
          className={cn(
            "size-full border-0 transition-opacity duration-200",
            ready ? "opacity-100" : "opacity-0"
          )}
        />
      ) : null}

      {!ready ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-subtle-foreground">
            <span className="live-dot size-1.5 rounded-full bg-live" />
            starting
          </span>
        </div>
      ) : null}
    </div>
  );
}
