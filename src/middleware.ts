import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // If no role on token, kick to login (corrupted session)
    if (!token?.role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Admin routes — SUPER_ADMIN only
    if (pathname.startsWith("/admin") && token.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/client", req.url));
    }

    // Client routes — CLIENT only
    if (pathname.startsWith("/client") && token.role !== "CLIENT") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/client",
    "/client/:path*",
  ],
};
