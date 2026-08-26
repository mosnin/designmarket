import type { Listing } from "./types";

/**
 * SHIP SCORE
 * ==========
 * An objective 0–100 grade built only from facts we can point at, never from
 * votes. Every dimension returns its own arithmetic so the detail page can
 * show the whole working — the promise is "we grade on evidence and you can
 * check us", which only holds if the breakdown is visible.
 *
 * Dimensions that cannot apply to a listing (bundle size for a hosted AI tool,
 * say) are marked N/A and dropped from the denominator rather than scored
 * zero, so a SaaS product isn't punished for not being an npm package.
 */

export type ScoreDimension = {
  id: string;
  label: string;
  /** null when the dimension does not apply to this kind of listing */
  points: number | null;
  max: number;
  /** the evidence, in one short phrase */
  note: string;
};

export type ShipScore = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  dimensions: ScoreDimension[];
  /** sum of max values for the dimensions that applied */
  applicableMax: number;
  earned: number;
};

const DAY = 86_400_000;

function na(id: string, label: string, max: number, note: string): ScoreDimension {
  return { id, label, points: null, max, note };
}

function licenseScore(listing: Listing): ScoreDimension {
  const max = 15;
  const bucket = listing.licenseBucket;
  if (bucket === "mit" || bucket === "apache-2.0" || bucket === "bsd-3") {
    return {
      id: "license",
      label: "License",
      points: max,
      max,
      note: `${listing.license} — permissive, ship it anywhere`,
    };
  }
  if (bucket === "gpl") {
    return {
      id: "license",
      label: "License",
      points: 7,
      max,
      note: `${listing.license} — copyleft, check obligations before shipping`,
    };
  }
  if (bucket === "commercial") {
    return {
      id: "license",
      label: "License",
      points: 10,
      max,
      note: "Commercial terms, clearly stated",
    };
  }
  if (bucket === "free-personal") {
    return {
      id: "license",
      label: "License",
      points: 6,
      max,
      note: "Free for personal use — commercial use restricted",
    };
  }
  return { id: "license", label: "License", points: 0, max, note: "No license stated" };
}

function maintenanceScore(listing: Listing): ScoreDimension {
  const max = 20;
  const last = listing.facts.lastCommit;
  if (!last) {
    return na("maintenance", "Maintenance", max, "No commit history available");
  }
  const age = Date.now() - last;
  const table: [number, number, string][] = [
    [30 * DAY, 20, "Active — committed within the last month"],
    [90 * DAY, 16, "Committed within the last quarter"],
    [180 * DAY, 11, "Committed within six months"],
    [365 * DAY, 6, "Quiet for over six months"],
    [Infinity, 2, "No commits in over a year"],
  ];
  for (const [limit, points, note] of table) {
    if (age < limit) {
      return { id: "maintenance", label: "Maintenance", points, max, note };
    }
  }
  return { id: "maintenance", label: "Maintenance", points: 2, max, note: "Dormant" };
}

/** Log-scaled so a 10× difference in adoption is a fixed number of points. */
function adoptionScore(listing: Listing): ScoreDimension {
  const max = 15;
  const downloads = listing.facts.weeklyDownloads ?? 0;
  const stars = listing.facts.githubStars ?? 0;
  const signal = Math.max(downloads, stars * 20);
  if (signal === 0) {
    return na("adoption", "Adoption", max, "No public usage signal yet");
  }
  // 1k signal -> ~5, 100k -> ~10, 10m -> 15
  const points = Math.max(
    2,
    Math.min(max, Math.round(((Math.log10(signal) - 2) / 5) * max + 2))
  );
  const note = downloads
    ? `${downloads.toLocaleString()} weekly npm downloads`
    : `${stars.toLocaleString()} GitHub stars`;
  return { id: "adoption", label: "Adoption", points, max, note };
}

function typesScore(listing: Listing): ScoreDimension {
  const max = 10;
  if (listing.kind === "tool" && !listing.npm) {
    return na("types", "TypeScript", max, "Not a package");
  }
  return listing.stack.typescript
    ? { id: "types", label: "TypeScript", points: max, max, note: "Ships its own types" }
    : { id: "types", label: "TypeScript", points: 0, max, note: "No bundled type definitions" };
}

function a11yScore(listing: Listing): ScoreDimension {
  const max = 15;
  const value = listing.stack.a11y;
  if (value === "audited") {
    return {
      id: "a11y",
      label: "Accessibility",
      points: max,
      max,
      note: "Documented keyboard and screen-reader support",
    };
  }
  if (value === "partial") {
    return {
      id: "a11y",
      label: "Accessibility",
      points: 8,
      max,
      note: "Partial — some patterns documented, gaps remain",
    };
  }
  return {
    id: "a11y",
    label: "Accessibility",
    points: 0,
    max,
    note: "No accessibility documentation found",
  };
}

function weightScore(listing: Listing): ScoreDimension {
  const max = 10;
  const bytes = listing.facts.bundleBytes;
  if (!bytes) {
    return na("weight", "Bundle weight", max, "Nothing to bundle");
  }
  const kb = bytes / 1024;
  const points = kb < 5 ? 10 : kb < 15 ? 9 : kb < 40 ? 7 : kb < 90 ? 5 : kb < 200 ? 3 : 1;
  return {
    id: "weight",
    label: "Bundle weight",
    points,
    max,
    note: `${kb.toFixed(1)} kB min+gzip`,
  };
}

function depsScore(listing: Listing): ScoreDimension {
  const max = 10;
  const deps = listing.facts.dependencies;
  if (deps === undefined) {
    return na("deps", "Dependencies", max, "Not a package");
  }
  const points = deps === 0 ? 10 : deps <= 2 ? 9 : deps <= 5 ? 7 : deps <= 12 ? 4 : 2;
  return {
    id: "deps",
    label: "Dependencies",
    points,
    max,
    note: deps === 0 ? "Zero runtime dependencies" : `${deps} runtime ${deps === 1 ? "dependency" : "dependencies"}`,
  };
}

function docsScore(listing: Listing): ScoreDimension {
  const max = 5;
  return listing.facts.hasDocs
    ? { id: "docs", label: "Documentation", points: max, max, note: "Dedicated docs site" }
    : { id: "docs", label: "Documentation", points: 1, max, note: "README only" };
}

export function computeShipScore(listing: Listing): ShipScore {
  const dimensions: ScoreDimension[] = [
    licenseScore(listing),
    maintenanceScore(listing),
    adoptionScore(listing),
    a11yScore(listing),
    typesScore(listing),
    weightScore(listing),
    depsScore(listing),
    docsScore(listing),
  ];

  let earned = 0;
  let applicableMax = 0;
  for (const d of dimensions) {
    if (d.points === null) continue;
    earned += d.points;
    applicableMax += d.max;
  }

  const score = applicableMax === 0 ? 0 : Math.round((earned / applicableMax) * 100);
  const grade = score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : "D";

  return { score, grade, dimensions, applicableMax, earned };
}

export function gradeColor(grade: ShipScore["grade"]): string {
  switch (grade) {
    case "A":
      return "var(--success)";
    case "B":
      return "var(--accent)";
    case "C":
      return "var(--warning)";
    default:
      return "var(--danger)";
  }
}
