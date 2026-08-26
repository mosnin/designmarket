export type NavLink = {
  href: string;
  label: string;
  icon: string;
  /** small trailing marker, e.g. the live dot on component browsing */
  flag?: "live" | "new" | "pro";
  description?: string;
};

export const primaryNav: readonly NavLink[] = [
  { href: "/explore", label: "Explore", icon: "Compass", description: "Everything, newest first" },
  { href: "/components", label: "Components", icon: "Component", flag: "live", description: "Browse individual components, rendered" },
  { href: "/libraries", label: "Libraries", icon: "Boxes", description: "Full UI kits and design systems" },
  { href: "/tools", label: "AI Tools", icon: "Sparkles", description: "Models, agents and the plumbing" },
  { href: "/stacks", label: "Stacks", icon: "LayoutList", description: "Collections you can actually install" },
  { href: "/drop", label: "The Drop", icon: "CalendarDays", description: "Today's curated set" },
  { href: "/compare", label: "Compare", icon: "Columns3", description: "Render candidates side by side" },
] as const;

export const accountNav: readonly NavLink[] = [
  { href: "/me/bookmarks", label: "Bookmarks", icon: "Bookmark" },
  { href: "/me/boards", label: "Boards", icon: "FolderHeart" },
  { href: "/me/remixes", label: "Remixes", icon: "Wand2" },
  { href: "/me/submissions", label: "Submissions", icon: "Upload" },
] as const;

export const topTabs: readonly { href: string; label: string }[] = [
  { href: "/explore", label: "Explore" },
  { href: "/drop", label: "The Drop" },
  { href: "/stacks", label: "Stacks" },
  { href: "/mcp", label: "For Agents" },
] as const;
