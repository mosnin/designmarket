import { NextResponse, type NextRequest } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

/**
 * Almost nothing is gated. Browsing, searching and rendering components are
 * open logged out on purpose — the wall is only in front of things that need
 * an account to mean anything, and even then the server components re-check,
 * because middleware knows whether you are signed in but only the database
 * knows whether you are staff.
 */
const isSignedInRoute = createRouteMatcher(["/me(.*)", "/submit(.*)", "/admin(.*)"]);
const isAuthPage = createRouteMatcher(["/signin", "/signup"]);

const AUTH_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * Built only when there is a deployment to authenticate against. Constructing
 * it unconditionally meant every build — including deployments with no Convex
 * URL set — initialised the whole auth stack inside the Edge bundle for no
 * reason.
 */
const authMiddleware = AUTH_CONFIGURED
  ? convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
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
    })
  : null;

export default function middleware(
  request: NextRequest,
  event: unknown
): ReturnType<NonNullable<typeof authMiddleware>> | NextResponse {
  // Without a deployment there is no session to read, so the middleware steps
  // aside rather than failing every request. The gated pages then render their
  // own "accounts are unavailable" state.
  if (!authMiddleware) return NextResponse.next();
  return authMiddleware(request, event as never);
}

export const config = {
  // Only the routes that actually need a session check — running auth on every
  // request in the catalogue is work done for nothing on the 99% of traffic
  // that is logged-out browsing.
  //
  // `/api/auth` is not a page and is not gated: it is the endpoint
  // `convexAuthNextjsMiddleware` itself serves, and the client posts every
  // sign-in, sign-up and token refresh to it. Leaving it out of the matcher
  // meant the middleware never ran for it, Next answered with its 404 page,
  // and the client tried to parse that HTML as JSON. Nobody could create an
  // account or sign in — on any deployment, by any method.
  matcher: [
    "/api/auth",
    "/api/auth/:path*",
    "/me/:path*",
    "/submit/:path*",
    "/admin/:path*",
    "/signin",
    "/signup",
  ],
};
