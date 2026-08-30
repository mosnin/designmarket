import {
  categoryBySlug,
  sectionById,
  sections,
  type Section,
  type SectionId,
} from "./taxonomy";

/**
 * Which section a URL belongs to.
 *
 * The master rail and the sidebar are both driven by this, so a route only has
 * to exist — it never has to register itself with the navigation.
 */
const PREFIX_TO_SECTION: [string, SectionId][] = [
  ["/ui", "ui"],
  ["/libraries", "ui"],
  ["/components", "ui"],
  ["/l", "explore"],
  ["/tools", "tools"],
  ["/mcp", "mcp"],
  ["/skills", "skills"],
  ["/apis", "apis"],
  ["/repos", "repos"],
  ["/stacks", "stacks"],
  ["/drop", "drop"],
  ["/compare", "compare"],
  ["/explore", "explore"],
];

export function sectionForPath(pathname: string): Section {
  // A category page belongs to whichever section owns that category.
  const categoryMatch = /^\/c\/([^/?#]+)/.exec(pathname);
  if (categoryMatch?.[1]) {
    const category = categoryBySlug.get(categoryMatch[1]);
    const section = category ? sectionById.get(category.section) : undefined;
    if (section) return section;
  }

  for (const [prefix, id] of PREFIX_TO_SECTION) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const section = sectionById.get(id);
      if (section) return section;
    }
  }

  return sectionById.get("explore") ?? sections[0]!;
}

/** The rail order, with the utility sections pushed to their own group. */
export const railGroups: { id: string; items: Section[] }[] = [
  {
    id: "catalogue",
    items: sections.filter((s) =>
      ["explore", "ui", "tools", "mcp", "skills", "apis", "repos"].includes(s.id)
    ),
  },
  {
    id: "tools",
    items: sections.filter((s) => ["stacks", "drop", "compare"].includes(s.id)),
  },
];
