import { NextRequest, NextResponse } from "next/server";

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isAuthPage = path.startsWith('/auth');
  const isDashboardPage = path.startsWith('/dashboard');

  // Simple check for the cookie. Better auth verify is on the client/components.
  const hasSession = request.cookies.has("order_stock_session");

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboardPage && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (path === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
