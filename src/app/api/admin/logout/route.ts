import { NextResponse } from "next/server";

import {
  ADMIN_TOKEN_COOKIE,
  useSecureCookie,
} from "@/src/modules/auth/cookie";

export async function POST() {
  const response = NextResponse.json({
    message: "Sesión cerrada correctamente",
  });

  response.cookies.set(ADMIN_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: useSecureCookie,
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}
