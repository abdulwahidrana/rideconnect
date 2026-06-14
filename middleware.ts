import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Role-based route protection.
 * /passenger/** -> passenger only
 * /driver/**    -> driver only
 * /admin/**     -> admin only
 */
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    const home: Record<string, string> = {
      passenger: "/passenger",
      driver: "/driver",
      admin: "/admin",
    };

    if (path.startsWith("/passenger") && role !== "passenger")
      return NextResponse.redirect(new URL(home[role ?? ""] ?? "/login", req.url));
    if (path.startsWith("/driver") && role !== "driver")
      return NextResponse.redirect(new URL(home[role ?? ""] ?? "/login", req.url));
    if (path.startsWith("/admin") && role !== "admin")
      return NextResponse.redirect(new URL(home[role ?? ""] ?? "/login", req.url));

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/passenger/:path*", "/driver/:path*", "/admin/:path*"],
};
