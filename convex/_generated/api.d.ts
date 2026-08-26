/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bookmarks from "../bookmarks.js";
import type * as collections from "../collections.js";
import type * as components_ from "../components.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as ingest from "../ingest.js";
import type * as ingestData from "../ingestData.js";
import type * as listings from "../listings.js";
import type * as profiles from "../profiles.js";
import type * as remixes from "../remixes.js";
import type * as seed from "../seed.js";
import type * as submit from "../submit.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bookmarks: typeof bookmarks;
  collections: typeof collections;
  components: typeof components_;
  crons: typeof crons;
  http: typeof http;
  ingest: typeof ingest;
  ingestData: typeof ingestData;
  listings: typeof listings;
  profiles: typeof profiles;
  remixes: typeof remixes;
  seed: typeof seed;
  submit: typeof submit;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
