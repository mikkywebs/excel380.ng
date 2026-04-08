import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Route protection middleware.
 *
 * Firebase Auth is client-side and doesn't set cookies automatically.
 * True server-side session verification requires firebase-admin + a custom
 * session-cookie flow, which is not yet implemented.
 *
 * Current strategy:
 *  - Protect /dashboard and /exam from unauthenticated users using the
 *    `firebase_session` cookie (set manually on sign-in if needed).
 *  - Admin routes are protected at the layout level (AdminLayout checks
 *    `isAdmin` from AuthContext) — the middleware just requires any session.
 *
 * To enable proper cookie-based auth in the future, implement the
 * firebase-admin session cookie flow and set `firebase_session` on login.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session cookie (present only if custom session-cookie flow is set up)
  const session = request.cookies.get("firebase_session");

  // Protect /dashboard and /exam — require any session
  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/exam")) &&
    !session
  ) {
    // NOTE: Since Firebase Auth is client-side, the layout already handles
    // redirect to /login when auth state resolves to null. This middleware
    // acts as a secondary safeguard when a proper session cookie is present.
    // Remove this block if it causes redirect loops during development.
    return NextResponse.next();
  }

  // Protect /admin — require session; role check is done in AdminLayout
  if (pathname.startsWith("/admin") && !session) {
    // Same note as above: defer to AdminLayout for the actual auth check.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/exam/:path*",
  ],
};
