import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Refresh catalogue facts once a day. Every number the site shows has a
 * `fetchedAt` behind it, and the detail pages say how old it is.
 */
crons.daily(
  "refresh listing facts",
  { hourUTC: 4, minuteUTC: 0 },
  internal.ingest.refreshAll,
  {}
);

export default crons;
