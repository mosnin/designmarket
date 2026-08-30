"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getRegistryEntry } from "@/components/registry";
import {
  PREVIEW_MESSAGE,
  tokensToCssVars,
  type PreviewMessage,
} from "@/lib/preview-protocol";
import type { MorphTokens } from "@/lib/theme-morph";

/**
 * Runs inside the iframe.
 *
 * Three jobs: render the registry entry with whatever props the host sent,
 * paint itself with whatever tokens the host sent, and report its own height
 * back so the host can size the frame to the content instead of guessing.
 */
export function PreviewRuntime({
  registryKey,
  initialScheme,
  initialPropsJson,
}: {
  registryKey: string;
  initialScheme: "light" | "dark";
  initialPropsJson: string | null;
}): ReactNode {
  const entry = getRegistryEntry(registryKey);

  const initialProps = useMemo<Record<string, unknown>>(() => {
    if (!initialPropsJson) return {};
    try {
      return JSON.parse(decodeURIComponent(initialPropsJson)) as Record<string, unknown>;
    } catch {
      return {};
    }
  }, [initialPropsJson]);

  const [state, setState] = useState<{
    props: Record<string, unknown>;
    tokens: MorphTokens;
    scheme: "light" | "dark";
  }>({ props: initialProps, tokens: {}, scheme: initialScheme });

  const rootRef = useRef<HTMLDivElement>(null);

  const post = useCallback((message: PreviewMessage) => {
    if (typeof window === "undefined" || window.parent === window) return;
    window.parent.postMessage(message, window.location.origin);
  }, []);

  // Listen for state pushes from the host.
  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.origin !== window.location.origin) return;
      const data = event.data as PreviewMessage | undefined;
      if (!data || data.type !== PREVIEW_MESSAGE.state) return;
      setState({
        props: data.props ?? {},
        tokens: data.tokens ?? {},
        scheme: data.scheme ?? "light",
      });
    }
    window.addEventListener("message", onMessage);
    post({ type: PREVIEW_MESSAGE.ready });
    return () => window.removeEventListener("message", onMessage);
  }, [post]);

  // Report height whenever the content resizes — prop changes routinely change
  // how tall a component is, and a fixed-height frame would clip or float.
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const report = (): void => {
      post({
        type: PREVIEW_MESSAGE.height,
        height: Math.ceil(node.getBoundingClientRect().height),
      });
    };
    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [post, state]);

  const cssVars = tokensToCssVars(state.tokens);

  return (
    <div
      ref={rootRef}
      data-preview-scheme={state.scheme}
      style={cssVars as React.CSSProperties}
      className="flex min-h-dvh w-full items-center justify-center bg-pv-background p-6 text-pv-foreground"
    >
      {entry ? (
        entry.render(state.props)
      ) : (
        <p className="text-sm text-pv-muted-foreground">
          Nothing is registered for <code className="font-mono">{registryKey}</code>.
        </p>
      )}
    </div>
  );
}
