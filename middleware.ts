import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_ROLE_COOKIE, AUTH_TOKEN_COOKIE } from "@/lib/auth-token";
import type { Role } from "@/lib/types";

function isRole(value: string | undefined): value is Role {
  return value === "CUSTOMER" || value === "TECHNICIAN" || value === "ADMIN";
}

function dashboardFor(role: Role): string {
  switch (role) {
    case "TECHNICIAN":
      return "/dashboard/technician";
    case "ADMIN":
      return "/dashboard/admin";
    case "CUSTOMER":
    default:
      return "/dashboard/customer";
  }
}

function expectedDashboardSegment(role: Role): string {
  switch (role) {
    case "TECHNICIAN":
      return "technician";
    case "ADMIN":
      return "admin";
    case "CUSTOMER":
    default:
      return "customer";
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  const roleCookie = request.cookies.get(AUTH_ROLE_COOKIE)?.value;
  const role = isRole(roleCookie) ? roleCookie : null;
  const isLoggedIn = Boolean(token && role);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isDashboard = pathname.startsWith("/dashboard");

  if (isAuthPage && isLoggedIn && role) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardFor(role);
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (isDashboard) {
    if (!isLoggedIn || !role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    const segment = expectedDashboardSegment(role);
    const roleRoot = `/dashboard/${segment}`;

    if (
      pathname !== roleRoot &&
      !pathname.startsWith(`${roleRoot}/`)
    ) {
      const url = request.nextUrl.clone();
      url.pathname = roleRoot;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
