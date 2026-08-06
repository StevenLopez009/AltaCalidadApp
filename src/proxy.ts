import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_token")?.value;

    console.log("TOKEN:", token);

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      jwt.verify(token, JWT_SECRET);

      return NextResponse.next();
    } catch (error) {
      console.log("JWT inválido", error);

      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
