import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_EXPIRES_KEY, AUTH_TOKEN_KEY } from "@/lib/auth-keys";

const PROTECTED_ROUTES = [
  "/my-account",
  "/checkout",
  "/checkout2",
  "/order-tracking",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
  const expiresAt = request.cookies.get(AUTH_EXPIRES_KEY)?.value;
  const isExpired = !expiresAt || Date.now() > Number(expiresAt);

  if (!token || isExpired) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_TOKEN_KEY);
    response.cookies.delete(AUTH_EXPIRES_KEY);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/my-account/:path*",
    "/checkout/:path*",
    "/checkout2/:path*",
    "/order-tracking/:path*",
  ],
};
