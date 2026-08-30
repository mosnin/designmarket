import type { MorphTokens } from "./theme-morph";

/**
 * The contract between the page and the sandbox iframe.
 *
 * Deliberately tiny and one-directional per message type: the host pushes
 * state down, the frame reports its measured height back up. Both sides check
 * `event.origin` against their own, and the frame is same-origin, so this is a
 * private channel rather than a public API.
 */

export const PREVIEW_MESSAGE = {
  /** frame -> host: mounted and listening */
  ready: "vitrine:preview:ready",
  /** host -> frame: props, tokens and colour scheme */
  state: "vitrine:preview:state",
  /** frame -> host: content height in px */
  height: "vitrine:preview:height",
  /** frame -> host: the render threw */
  error: "vitrine:preview:error",
} as const;

export type PreviewState = {
  type: typeof PREVIEW_MESSAGE.state;
  props: Record<string, unknown>;
  tokens: MorphTokens;
  scheme: "light" | "dark";
};

export type PreviewReady = { type: typeof PREVIEW_MESSAGE.ready };
export type PreviewHeight = { type: typeof PREVIEW_MESSAGE.height; height: number };
export type PreviewError = { type: typeof PREVIEW_MESSAGE.error; message: string };

export type PreviewMessage =
  | PreviewState
  | PreviewReady
  | PreviewHeight
  | PreviewError;

/** Token name -> the CSS custom property the sandbox reads. */
export function tokensToCssVars(tokens: MorphTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (typeof value === "string" && value.length) vars[`--pv-${key}`] = value;
  }
  return vars;
}
