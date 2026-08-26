import { NextResponse, type NextRequest } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * Almost nothing is gated. Browsing, searching and rendering components are
 * open logged out on purpose — the wall is only in front of things that need
 * an account to mean anything.
 */
const isSignedInRoute = createRouteMatcher(["/me(.*)", "/submit(.*)", "/admin(.*)"]);
const isAuthPage = createRouteMatcher(["/signin", "/signup"]);

const authMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const authed = await convexAuth.isAuthenticated();

    if (isSignedInRoute(request) && !authed) {
      const next = request.nextUrl.pathname + request.nextUrl.search;
      return nextjsMiddlewareRedirect(
        request,
        `/signin?next=${encodeURIComponent(next)}`
      );
    }
    if (isAuthPage(request) && authed) {
      return nextjsMiddlewareRedirect(request, "/");
    }
    return undefined;
  }
);

/**
 * Without a deployment there is no session to read, so the middleware steps
 * aside rather than failing every request. The gated pages then handle their
 * own "accounts are unavailable" state.
 */
const passthrough = (): NextResponse => NextResponse.next();

const middleware = process.env.NEXT_PUBLIC_CONVEX_URL
  ? authMiddleware
  : (passthrough as unknown as (request: NextRequest) => NextResponse);

export default middleware;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
