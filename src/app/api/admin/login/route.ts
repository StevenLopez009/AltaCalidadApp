import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { login } from "@/src/modules/auth/services/auth.service";
import {
  ADMIN_TOKEN_COOKIE,
  useSecureCookie,
} from "@/src/modules/auth/cookie";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Usuario y contraseña son obligatorios." },
        { status: 400 },
      );
    }

    const token = await login(username, password);

    if (!token) {
      return NextResponse.json(
        { message: "Credenciales inválidas." },
        { status: 401 },
      );
    }

    const cookieStore = await cookies();

    cookieStore.set(ADMIN_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: useSecureCookie,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Error interno del servidor.",
      },
      {
        status: 500,
      },
    );
  }
}
