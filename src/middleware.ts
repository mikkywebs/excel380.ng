import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This is a placeholder for the actual session check logic.
// In a real Firebase app, you would verify the session cookie or token here.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Get the session (e.g., from a cookie)
  const session = request.cookies.get("firebase_session");

  // 2. Protect /dashboard and /exam (Auth Required)
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/exam")) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 3. Protect /admin (Admin Role Required)
  if (pathname.startsWith("/admin")) {
    // In a real app, you would check the user's role from the session token's claims.
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Placeholder for admin check (would typically be decoded from JWT)
    const isAdmin = request.cookies.get("user_role")?.value === "admin";
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
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
