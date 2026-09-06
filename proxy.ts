import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  // -----------------------------
  // ADMIN ROUTES
  // -----------------------------
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  // -----------------------------
  // USER ROUTES
  // -----------------------------
  const userRoutes = [
    "/cart",
    "/checkout",
    "/order-success",
    "/orders",
    "/profile",
    "/wishlist",
    "/products",
  ];

  const isUserRoute = userRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // -----------------------------
  // ADMIN ROUTE PROTECTION
  // -----------------------------
  if (isAdminRoute) {
    // Not logged in
    if (!user) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Logged in but NOT admin
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Admin is allowed
    return NextResponse.next();
  }

  // -----------------------------
  // USER ROUTE PROTECTION
  // -----------------------------
  if (isUserRoute) {
    // Not logged in
    if (!user) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(loginUrl);
    }

    // Admin trying to access user panel
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Normal user is allowed
    return NextResponse.next();
  }

  // -----------------------------
  // PUBLIC ROUTES
  // -----------------------------
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/order-success/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/wishlist/:path*",
    "/products/:path*",
  ],
};
