import { NextResponse } from "next/server";
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/|external/|workflow).*)"
  ]
};
export function middleware(request: any) {
  const url = new URL(request.url);
  const isAuthenticated = request.cookies.get("isAuthenticated")?.value;

  const isAuthPage = url.pathname === "/auth";
  const notLoggedInUrl = new URL("/auth", request.url).toString();
  const homeUrl = new URL("/", request.url).toString();

  // Redirect to home if already logged in and trying to access login/signup
  if (!!isAuthenticated && isAuthPage) {
    return NextResponse.redirect(homeUrl);
  }

  // Redirect to login if not logged in and trying to access protected routes
  if (!isAuthenticated && !isAuthPage) {
    return NextResponse.redirect(notLoggedInUrl);
  }

  // Continue with the request otherwise
  return NextResponse.next();
}