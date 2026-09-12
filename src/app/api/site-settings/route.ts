import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  getHeroTitle,
  updateHeroTitle,
} from "@/src/modules/settings/services/settings.service";

async function isAdmin() {
  const token = (await cookies()).get("admin_token")?.value;

  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);

    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const heroTitle = await getHeroTitle();

    return NextResponse.json({ heroTitle });
  } catch (error) {
    console.error("Error obteniendo la configuración del sitio:", error);

    return NextResponse.json(
      { message: "Error obteniendo la configuración" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  // El encabezado es público: solo la sesión de administración puede cambiarlo.
  if (!(await isAdmin())) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (typeof body.heroTitle !== "string") {
      return NextResponse.json(
        { message: "El título es obligatorio" },
        { status: 400 },
      );
    }

    const heroTitle = await updateHeroTitle(body.heroTitle);

    return NextResponse.json({ heroTitle });
  } catch (error) {
    console.error("Error guardando la configuración del sitio:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error guardando la configuración",
      },
      { status: 400 },
    );
  }
}
