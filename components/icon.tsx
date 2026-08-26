"use client";

// Deep imports, one file per icon.
//
// The barrel at the package root re-exports 14,716 icons across 24,122
// files. Naming forty of them in a `{ ... } from "@hugeicons/core-free-icons"`
// import asks the bundler to parse the whole set on every compile and
// trusts tree-shaking to throw the rest away. Pointing at the forty files
// we actually use costs nothing and leaves nothing to trust.
import AiMagicIcon from "@hugeicons/core-free-icons/dist/esm/AiMagicIcon";
import Alert02Icon from "@hugeicons/core-free-icons/dist/esm/Alert02Icon";
import ApiIcon from "@hugeicons/core-free-icons/dist/esm/ApiIcon";
import ArrowDataTransferVerticalIcon from "@hugeicons/core-free-icons/dist/esm/ArrowDataTransferVerticalIcon";
import ArrowLeft02Icon from "@hugeicons/core-free-icons/dist/esm/ArrowLeft02Icon";
import ArrowRight02Icon from "@hugeicons/core-free-icons/dist/esm/ArrowRight02Icon";
import ArrowUpRight01Icon from "@hugeicons/core-free-icons/dist/esm/ArrowUpRight01Icon";
import Bookmark02Icon from "@hugeicons/core-free-icons/dist/esm/Bookmark02Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/dist/esm/Cancel01Icon";
import ChevronDownIcon from "@hugeicons/core-free-icons/dist/esm/ChevronDownIcon";
import Compass01Icon from "@hugeicons/core-free-icons/dist/esm/Compass01Icon";
import ComponentIcon from "@hugeicons/core-free-icons/dist/esm/ComponentIcon";
import ComputerIcon from "@hugeicons/core-free-icons/dist/esm/ComputerIcon";
import ConnectIcon from "@hugeicons/core-free-icons/dist/esm/ConnectIcon";
import Copy01Icon from "@hugeicons/core-free-icons/dist/esm/Copy01Icon";
import Delete02Icon from "@hugeicons/core-free-icons/dist/esm/Delete02Icon";
import FilterIcon from "@hugeicons/core-free-icons/dist/esm/FilterIcon";
import Folder02Icon from "@hugeicons/core-free-icons/dist/esm/Folder02Icon";
import GitForkIcon from "@hugeicons/core-free-icons/dist/esm/GitForkIcon";
import Grid2X2Icon from "@hugeicons/core-free-icons/dist/esm/Grid2X2Icon";
import Layers01Icon from "@hugeicons/core-free-icons/dist/esm/Layers01Icon";
import Link02Icon from "@hugeicons/core-free-icons/dist/esm/Link02Icon";
import Loading03Icon from "@hugeicons/core-free-icons/dist/esm/Loading03Icon";
import LogoutSquare01Icon from "@hugeicons/core-free-icons/dist/esm/LogoutSquare01Icon";
import MagicWand01Icon from "@hugeicons/core-free-icons/dist/esm/MagicWand01Icon";
import Menu02Icon from "@hugeicons/core-free-icons/dist/esm/Menu02Icon";
import MinusIcon from "@hugeicons/core-free-icons/dist/esm/MinusIcon";
import Moon02Icon from "@hugeicons/core-free-icons/dist/esm/Moon02Icon";
import Mortarboard02Icon from "@hugeicons/core-free-icons/dist/esm/Mortarboard02Icon";
import PlusIcon from "@hugeicons/core-free-icons/dist/esm/PlusIcon";
import RefreshIcon from "@hugeicons/core-free-icons/dist/esm/RefreshIcon";
import Search01Icon from "@hugeicons/core-free-icons/dist/esm/Search01Icon";
import Setting06Icon from "@hugeicons/core-free-icons/dist/esm/Setting06Icon";
import Shield01Icon from "@hugeicons/core-free-icons/dist/esm/Shield01Icon";
import SparklesIcon from "@hugeicons/core-free-icons/dist/esm/SparklesIcon";
import Sun02Icon from "@hugeicons/core-free-icons/dist/esm/Sun02Icon";
import Tick02Icon from "@hugeicons/core-free-icons/dist/esm/Tick02Icon";
import Upload02Icon from "@hugeicons/core-free-icons/dist/esm/Upload02Icon";
import UserCircleIcon from "@hugeicons/core-free-icons/dist/esm/UserCircleIcon";
import ViewIcon from "@hugeicons/core-free-icons/dist/esm/ViewIcon";
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
