import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("admin_session");
  const path = request.nextUrl.pathname;

  const isDashboardRoute = path.startsWith("/dashboard");

  // If user tries to access /dashboard without login, redirect to login page (/)
  if (isDashboardRoute && !session) {
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user is already logged in and tries to access login (/) or register, redirect to dashboard
  if (path === "/" && session) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/",
  ],
};
