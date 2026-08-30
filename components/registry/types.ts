import type { ReactNode } from "react";

export type RegistryEntry = {
  /** Renders the component with the playground's current props. */
  render: (props: Record<string, unknown>) => ReactNode;
  /**
   * A usage snippet for the code panel. Deliberately labelled "usage" rather
   * than "source": this is how you call the real package, not a copy of its
   * internals, and pretending otherwise would be the same sin as a screenshot
   * pretending to be a render.
   */
  usage: string;
  /** Extra vertical room this preview wants, in px. */
  height?: number;
};
