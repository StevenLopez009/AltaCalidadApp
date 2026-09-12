import { NextResponse } from "next/server";

import {
  createAddon,
  getAddonsByService,
  getAllAddons,
} from "@/src/modules/services/repositories/addons.repositories";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const serviceId = searchParams.get("serviceId");

    if (serviceId) {
      const id = Number(serviceId);

      if (!Number.isInteger(id) || id <= 0) {
        return NextResponse.json(
          { message: "El servicio no es válido" },
          { status: 400 },
        );
      }

      return NextResponse.json(await getAddonsByService(id));
    }

    return NextResponse.json(await getAllAddons());
  } catch (error) {
    console.error("Error obteniendo adicionales:", error);

    return NextResponse.json(
      { message: "Error obteniendo los adicionales" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const serviceId = Number(body.serviceId);
    const name = String(body.name ?? "").trim();
    const price = Number(body.price);

    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      return NextResponse.json(
        { message: "El servicio es obligatorio" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: "El nombre del adicional es obligatorio" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { message: "El precio del adicional no es válido" },
        { status: 400 },
      );
    }

    const result = await createAddon({ serviceId, name, price });

    return NextResponse.json(
      { message: "Adicional creado correctamente", id: result.insertId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creando adicional:", error);

    return NextResponse.json(
      { message: "Error creando el adicional" },
      { status: 500 },
    );
  }
}
