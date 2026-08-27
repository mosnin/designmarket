import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * THE BUILD THIS TEST EXISTS TO PROTECT
 *
 * `siteConfig.url` feeds `metadataBase: new URL(...)` in `lib/metadata.ts`,
 * which the root layout imports. If it ever yields something `new URL` cannot
 * parse, Next throws while collecting page data for `/_not-found` and the
 * whole production build dies — with a stack pointing at metadata rather than
 * at the environment variable that actually caused it.
 *
 * That happened. `?? "https://vitrine.dev"` only catches `undefined`, and a
 * blank field in the Vercel dashboard sets the variable to `""`, which is
 * defined. Every deployment failed at `ERR_INVALID_URL` with `input: ''`.
 *
 * So the contract is absolute: whatever the environment holds, this returns a
 * parseable absolute origin. There is no input that may fail the build.
 */

const KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL",
  "NEXT_PUBLIC_VERCEL_URL",
] as const;

/** Load `lib/config` fresh — it reads the environment once, at module scope. */
async function siteUrlWith(env: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) vi.stubEnv(key, env[key] ?? "");
  vi.resetModules();
  const { siteConfig } = await import("@/lib/config");
  return siteConfig.url;
}

afterEach(() => vi.unstubAllEnvs());

describe("siteConfig.url", () => {
  const FALLBACK = "https://vitrine.dev";

  it("falls back when the variable is defined but empty — the bug that broke the build", async () => {
    expect(await siteUrlWith({ NEXT_PUBLIC_SITE_URL: "" })).toBe(FALLBACK);
  });

  it("treats whitespace as absent", async () => {
    expect(await siteUrlWith({ NEXT_PUBLIC_SITE_URL: "   " })).toBe(FALLBACK);
  });

  it("ignores a value that is not a URL rather than throwing", async () => {
    expect(await siteUrlWith({ NEXT_PUBLIC_SITE_URL: "not a url" })).toBe(FALLBACK);
  });

  it("uses an explicit URL when one is set", async () => {
    expect(await siteUrlWith({ NEXT_PUBLIC_SITE_URL: "https://vitrine.dev" })).toBe(
      "https://vitrine.dev"
    );
  });

  it("adds the scheme Vercel omits from its host variables", async () => {
    expect(await siteUrlWith({ NEXT_PUBLIC_VERCEL_URL: "dm-abc.vercel.app" })).toBe(
      "https://dm-abc.vercel.app"
    );
  });

  it("prefers the production domain over a per-deployment preview host", async () => {
    expect(
      await siteUrlWith({
        NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: "vitrine.dev",
        NEXT_PUBLIC_VERCEL_URL: "dm-abc.vercel.app",
      })
    ).toBe("https://vitrine.dev");
  });

  it("never returns something `new URL` cannot parse", async () => {
    const hostile = ["", " ", "not a url", "://", "http://", "https://  ", "\n", "]["];
    for (const value of hostile) {
      const url = await siteUrlWith({ NEXT_PUBLIC_SITE_URL: value });
      expect(() => new URL(url), `input ${JSON.stringify(value)}`).not.toThrow();
    }
  });
});
