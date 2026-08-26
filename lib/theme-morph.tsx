"use client";

/**
 * THEME MORPH
 * ===========
 * The site-wide "try it in my design system" switch. A token set lives here,
 * is persisted per-browser, and is pushed into every live preview frame.
 *
 * Token names are deliberately shadcn/ui-compatible, because that is what
 * people already have in their `globals.css` and can paste in whole.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useMounted } from "./use-mounted";

export const MORPH_TOKEN_KEYS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "radius",
] as const;

export type MorphTokenKey = (typeof MORPH_TOKEN_KEYS)[number];
export type MorphTokens = Partial<Record<MorphTokenKey, string>>;

export type MorphPreset = {
  id: string;
  name: string;
  blurb: string;
  light: MorphTokens;
  dark: MorphTokens;
};

/** Built-in presets. `vitrine` mirrors this site's own tokens. */
export const morphPresets: readonly MorphPreset[] = [
  {
    id: "vitrine",
    name: "Vitrine",
    blurb: "This site's own tokens",
    light: {
      background: "#fbfbf9", foreground: "#0b0b0f", card: "#ffffff",
      "card-foreground": "#0b0b0f", popover: "#ffffff", "popover-foreground": "#0b0b0f",
      primary: "#6244f5", "primary-foreground": "#ffffff",
      secondary: "#f1f1ec", "secondary-foreground": "#0b0b0f",
      muted: "#f1f1ec", "muted-foreground": "#6b6b73",
      accent: "#efecff", "accent-foreground": "#6244f5",
      destructive: "#d1373a", "destructive-foreground": "#ffffff",
      border: "#e7e5e0", input: "#e7e5e0", ring: "#6244f5", radius: "0.75rem",
    },
    dark: {
      background: "#08080b", foreground: "#f6f6f7", card: "#0e0e13",
      "card-foreground": "#f6f6f7", popover: "#16161d", "popover-foreground": "#f6f6f7",
      primary: "#8b75ff", "primary-foreground": "#0b0b0f",
      secondary: "#14141b", "secondary-foreground": "#f6f6f7",
      muted: "#14141b", "muted-foreground": "#9a9aa6",
      accent: "#1c1733", "accent-foreground": "#8b75ff",
      destructive: "#ff6369", "destructive-foreground": "#0b0b0f",
      border: "#1f1f28", input: "#1f1f28", ring: "#8b75ff", radius: "0.75rem",
    },
  },
  {
    id: "slate",
    name: "Slate",
    blurb: "shadcn/ui default",
    light: {
      background: "#ffffff", foreground: "#020817", card: "#ffffff",
      "card-foreground": "#020817", popover: "#ffffff", "popover-foreground": "#020817",
      primary: "#0f172a", "primary-foreground": "#f8fafc",
      secondary: "#f1f5f9", "secondary-foreground": "#0f172a",
      muted: "#f1f5f9", "muted-foreground": "#64748b",
      accent: "#f1f5f9", "accent-foreground": "#0f172a",
      destructive: "#ef4444", "destructive-foreground": "#f8fafc",
      border: "#e2e8f0", input: "#e2e8f0", ring: "#020817", radius: "0.5rem",
    },
    dark: {
      background: "#020817", foreground: "#f8fafc", card: "#020817",
      "card-foreground": "#f8fafc", popover: "#020817", "popover-foreground": "#f8fafc",
      primary: "#f8fafc", "primary-foreground": "#0f172a",
      secondary: "#1e293b", "secondary-foreground": "#f8fafc",
      muted: "#1e293b", "muted-foreground": "#94a3b8",
      accent: "#1e293b", "accent-foreground": "#f8fafc",
      destructive: "#7f1d1d", "destructive-foreground": "#f8fafc",
      border: "#1e293b", input: "#1e293b", ring: "#cbd5e1", radius: "0.5rem",
    },
  },
  {
    id: "citrus",
    name: "Citrus",
    blurb: "High-energy lime on ink",
    light: {
      background: "#fefef7", foreground: "#12130c", card: "#ffffff",
      "card-foreground": "#12130c", popover: "#ffffff", "popover-foreground": "#12130c",
      primary: "#3f6212", "primary-foreground": "#f7fee7",
      secondary: "#f0f7dc", "secondary-foreground": "#12130c",
      muted: "#f2f5e8", "muted-foreground": "#5f6b4a",
      accent: "#ecfccb", "accent-foreground": "#3f6212",
      destructive: "#dc2626", "destructive-foreground": "#ffffff",
      border: "#e4e9d3", input: "#e4e9d3", ring: "#65a30d", radius: "0.25rem",
    },
    dark: {
      background: "#0c0d08", foreground: "#f7fee7", card: "#12130c",
      "card-foreground": "#f7fee7", popover: "#171a0f", "popover-foreground": "#f7fee7",
      primary: "#bef264", "primary-foreground": "#1a2e05",
      secondary: "#1c2013", "secondary-foreground": "#f7fee7",
      muted: "#1c2013", "muted-foreground": "#a3b18a",
      accent: "#22300f", "accent-foreground": "#bef264",
      destructive: "#f87171", "destructive-foreground": "#0c0d08",
      border: "#252b18", input: "#252b18", ring: "#bef264", radius: "0.25rem",
    },
  },
  {
    id: "porcelain",
    name: "Porcelain",
    blurb: "Soft, round, editorial",
    light: {
      background: "#faf7f5", foreground: "#2b2320", card: "#ffffff",
      "card-foreground": "#2b2320", popover: "#ffffff", "popover-foreground": "#2b2320",
      primary: "#b4543a", "primary-foreground": "#fff8f5",
      secondary: "#f3ebe6", "secondary-foreground": "#2b2320",
      muted: "#f3ebe6", "muted-foreground": "#8a7a72",
      accent: "#fbe9e2", "accent-foreground": "#b4543a",
      destructive: "#c0392b", "destructive-foreground": "#ffffff",
      border: "#eadfd8", input: "#eadfd8", ring: "#b4543a", radius: "1.25rem",
    },
    dark: {
      background: "#191412", foreground: "#f5ebe6", card: "#221b18",
      "card-foreground": "#f5ebe6", popover: "#2a211d", "popover-foreground": "#f5ebe6",
      primary: "#e08a6d", "primary-foreground": "#191412",
      secondary: "#2a211d", "secondary-foreground": "#f5ebe6",
      muted: "#2a211d", "muted-foreground": "#b3a099",
      accent: "#37271f", "accent-foreground": "#e08a6d",
      destructive: "#ef7a70", "destructive-foreground": "#191412",
      border: "#33272220", input: "#332722", ring: "#e08a6d", radius: "1.25rem",
    },
  },
] as const;

/**
 * Pull `--token: value` pairs out of pasted CSS. Accepts a whole `globals.css`,
 * a bare `:root { ... }` block, or a naked list of declarations. Understands
 * both hex/rgb values and shadcn's older space-separated HSL triples.
 */
export function parseTokenCss(css: string): { light: MorphTokens; dark: MorphTokens } {
  const light: MorphTokens = {};
  const dark: MorphTokens = {};
  const known = new Set<string>(MORPH_TOKEN_KEYS);

  const blocks: { target: MorphTokens; body: string }[] = [];
  const darkBlock = /(?:\.dark|\[data-theme=["']?dark["']?\]|@media[^{]*prefers-color-scheme:\s*dark[^{]*)\s*\{([\s\S]*?)\n\s*\}/i.exec(css);
  const rootBlock = /:root\s*\{([\s\S]*?)\n?\s*\}/.exec(css);

  if (rootBlock?.[1]) blocks.push({ target: light, body: rootBlock[1] });
  if (darkBlock?.[1]) blocks.push({ target: dark, body: darkBlock[1] });
  if (blocks.length === 0) blocks.push({ target: light, body: css });

  for (const { target, body } of blocks) {
    const decl = /--([a-z0-9-]+)\s*:\s*([^;}]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = decl.exec(body)) !== null) {
      const name = m[1]!.toLowerCase();
      if (!known.has(name)) continue;
      const raw = m[2]!.trim();
      target[name as MorphTokenKey] = normalizeTokenValue(name, raw);
    }
  }
  return { light, dark };
}

function normalizeTokenValue(name: string, raw: string): string {
  if (name === "radius") return raw;
  // shadcn pre-v4 stored bare HSL triples: "222.2 47.4% 11.2%"
  if (/^[\d.]+\s+[\d.]+%\s+[\d.]+%$/.test(raw)) return `hsl(${raw})`;
  return raw;
}

export function tokensToCss(tokens: MorphTokens): string {
  return Object.entries(tokens)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n");
}

type MorphState = {
  presetId: string;
  tokens: { light: MorphTokens; dark: MorphTokens };
  custom: boolean;
};

type MorphContextValue = MorphState & {
  ready: boolean;
  applyPreset: (id: string) => void;
  applyCss: (css: string) => { ok: boolean; found: number };
  reset: () => void;
  /** serialised for handing to a preview frame */
  payload: { light: MorphTokens; dark: MorphTokens; presetId: string };
};

const defaultPreset = morphPresets[0]!;
const STORAGE_KEY = "vitrine.theme-morph.v1";

const DEFAULT_STATE: MorphState = {
  presetId: defaultPreset.id,
  tokens: { light: defaultPreset.light, dark: defaultPreset.dark },
  custom: false,
};

/**
 * localStorage is genuinely an external store, so it is read through
 * `useSyncExternalStore` rather than copied into state inside an effect. Two
 * things fall out of that for free: no cascading render on mount, and the
 * `storage` event keeps every open tab morphed the same way.
 */
const listeners = new Set<() => void>();
let cached: MorphState | null = null;

function readStore(): MorphState {
  if (cached) return cached;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    cached = stored ? (JSON.parse(stored) as MorphState) : DEFAULT_STATE;
  } catch {
    cached = DEFAULT_STATE;
  }
  return cached;
}

function writeStore(next: MorphState): void {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode — the morph still applies for this session */
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return;
    cached = null;
    onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const MorphContext = createContext<MorphContextValue | null>(null);

export function ThemeMorphProvider({ children }: { children: ReactNode }): ReactNode {
  const state = useSyncExternalStore(subscribe, readStore, () => DEFAULT_STATE);
  const ready = useMounted();

  const applyPreset = useCallback((id: string) => {
    const preset = morphPresets.find((p) => p.id === id) ?? defaultPreset;
    writeStore({
      presetId: preset.id,
      tokens: { light: preset.light, dark: preset.dark },
      custom: false,
    });
  }, []);

  const applyCss = useCallback((css: string) => {
    const parsed = parseTokenCss(css);
    const found =
      Object.keys(parsed.light).length + Object.keys(parsed.dark).length;
    if (found === 0) return { ok: false, found: 0 };
    writeStore({
      presetId: "custom",
      tokens: {
        light: { ...defaultPreset.light, ...parsed.light },
        dark: {
          ...defaultPreset.dark,
          ...(Object.keys(parsed.dark).length ? parsed.dark : parsed.light),
        },
      },
      custom: true,
    });
    return { ok: true, found };
  }, []);

  const reset = useCallback(() => applyPreset(defaultPreset.id), [applyPreset]);

  const value = useMemo<MorphContextValue>(
    () => ({
      ...state,
      ready,
      applyPreset,
      applyCss,
      reset,
      payload: { ...state.tokens, presetId: state.presetId },
    }),
    [state, ready, applyPreset, applyCss, reset]
  );

  return <MorphContext.Provider value={value}>{children}</MorphContext.Provider>;
}

export function useThemeMorph(): MorphContextValue {
  const ctx = useContext(MorphContext);
  if (!ctx) {
    throw new Error("useThemeMorph must be used inside <ThemeMorphProvider>");
  }
  return ctx;
}
