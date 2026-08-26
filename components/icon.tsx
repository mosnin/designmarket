"use client";

import {
  AiMagicIcon,
  Alert02Icon,
  ArrowDataTransferVerticalIcon,
  ArrowLeft02Icon,
  ArrowRight02Icon,
  ArrowUpRight01Icon,
  ApiIcon,
  Bookmark02Icon,
  Cancel01Icon,
  ChevronDownIcon,
  Compass01Icon,
  ComponentIcon,
  ComputerIcon,
  ConnectIcon,
  Copy01Icon,
  Delete02Icon,
  FilterIcon,
  Folder02Icon,
  GitForkIcon,
  Grid2X2Icon,
  Layers01Icon,
  Link02Icon,
  Loading03Icon,
  LogoutSquare01Icon,
  MagicWand01Icon,
  Menu02Icon,
  MinusIcon,
  Moon02Icon,
  Mortarboard02Icon,
  PlusIcon,
  RefreshIcon,
  Search01Icon,
  Setting06Icon,
  Shield01Icon,
  SparklesIcon,
  Sun02Icon,
  Tick02Icon,
  Upload02Icon,
  UserCircleIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * ONE ICON SET, ONE PLACE.
 *
 * Icons are HugeIcons rather than the default-looking set every generated app
 * ships with, and they are addressed by role — "back", "external", "sort" —
 * not by glyph name. Changing what "sort" looks like is then a one-line edit
 * here rather than a search across forty files.
 *
 * The preview registry deliberately keeps lucide: those previews stand in for
 * shadcn/ui and friends, which ship with lucide, and swapping the icons would
 * misrepresent what you actually get when you install them.
 */
const ICONS = {
  // navigation
  explore: Compass01Icon,
  ui: ComponentIcon,
  tools: AiMagicIcon,
  mcp: ConnectIcon,
  skills: Mortarboard02Icon,
  apis: ApiIcon,
  repos: GitForkIcon,
  stacks: Layers01Icon,
  drop: SparklesIcon,
  compare: Grid2X2Icon,

  // chrome
  search: Search01Icon,
  menu: Menu02Icon,
  back: ArrowLeft02Icon,
  forward: ArrowRight02Icon,
  chevronDown: ChevronDownIcon,
  close: Cancel01Icon,
  check: Tick02Icon,
  minus: MinusIcon,
  plus: PlusIcon,
  copy: Copy01Icon,
  link: Link02Icon,
  external: ArrowUpRight01Icon,
  sort: ArrowDataTransferVerticalIcon,
  filter: FilterIcon,
  reset: RefreshIcon,
  loading: Loading03Icon,
  delete: Delete02Icon,
  alert: Alert02Icon,
  view: ViewIcon,

  // account
  bookmark: Bookmark02Icon,
  boards: Folder02Icon,
  remix: MagicWand01Icon,
  submit: Upload02Icon,
  profile: UserCircleIcon,
  settings: Setting06Icon,
  staff: Shield01Icon,
  signOut: LogoutSquare01Icon,
  upgrade: SparklesIcon,

  // theme
  light: Sun02Icon,
  dark: Moon02Icon,
  system: ComputerIcon,
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className,
  size = 16,
  strokeWidth = 1.6,
}: {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}): ReactNode {
  const glyph = ICONS[name];
  if (!glyph) return null;
  return (
    <HugeiconsIcon
      icon={glyph}
      size={size}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
    />
  );
}

export function hasIcon(name: string): name is IconName {
  return name in ICONS;
}
