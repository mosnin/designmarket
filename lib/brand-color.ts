/**
 * Brand colours come from the projects themselves, which means several of them
 * are near-black (shadcn/ui, Motion, Payload) or near-white. Painted raw they
 * disappear against one theme or the other, so every use goes through these
 * mixes: the brand still reads as itself, but always against enough of the
 * current foreground to stay legible in both themes.
 */

/** Text and marks — keeps the hue, guarantees contrast. */
export function brandInk(color: string): string {
  return `color-mix(in oklab, ${color} 45%, var(--foreground))`;
}

/** Tinted fills behind brand marks. */
export function brandWash(color: string, percent = 14): string {
  return `color-mix(in oklab, ${color} ${percent}%, var(--surface-2))`;
}

/** Hairlines and accents that sit on a surface. */
export function brandEdge(color: string, percent = 35): string {
  return `color-mix(in oklab, ${color} ${percent}%, var(--border))`;
}
