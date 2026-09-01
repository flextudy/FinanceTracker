import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

// Define protected page routes & protected API routes
const PROTECTED_PAGES = ["/dashboard", "/expenses", "/settlements", "/settings"];
const PROTECTED_APIS = ["/api/summary", "/api/expenses", "/api/settlements", "/api/users"];
const AUTH_PAGES = ["/sign-in", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("session")?.value;

  let isAuthenticated = false;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      isAuthenticated = true;
    }
  }

  // Check if current route is a protected page
  const isProtectedPage = PROTECTED_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // Check if current route is a protected API
  const isProtectedApi = PROTECTED_APIS.some(
    (api) => pathname === api || pathname.startsWith(`${api}/`)
  );

  // Check if current route is an auth page (login/forgot password/reset password)
  const isAuthPage = AUTH_PAGES.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  // 1. If trying to access a protected page without authentication -> redirect to /sign-in
  if (isProtectedPage && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // 2. If trying to access a protected API without authentication -> return 401 Unauthorized
  if (isProtectedApi && !isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized access. Please sign in." },
      { status: 401 }
    );
  }

  // 3. If authenticated user tries to visit auth pages -> redirect to /dashboard
  if (isAuthPage && isAuthenticated) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, logo images, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
