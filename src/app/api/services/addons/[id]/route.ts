import { NextResponse } from "next/server";

import {
  deleteAddon,
  getAddonById,
  updateAddon,
} from "@/src/modules/services/repositories/addons.repositories";

interface Props {
  params: Promise<{ id: string }>;
}

async function readId({ params }: Props) {
  const { id } = await params;

  const addonId = Number(id);

  return Number.isInteger(addonId) && addonId > 0 ? addonId : null;
}

export async function PUT(request: Request, context: Props) {
  const addonId = await readId(context);

  if (!addonId) {
    return NextResponse.json(
      { message: "El adicional no es válido" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    const name = String(body.name ?? "").trim();
    const price = Number(body.price);

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

    if (!(await getAddonById(addonId))) {
      return NextResponse.json(
        { message: "El adicional no existe" },
        { status: 404 },
      );
    }

    await updateAddon(addonId, { name, price });

    return NextResponse.json({ message: "Adicional actualizado" });
  } catch (error) {
    console.error("Error actualizando adicional:", error);

    return NextResponse.json(
      { message: "Error actualizando el adicional" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: Props) {
  const addonId = await readId(context);

  if (!addonId) {
    return NextResponse.json(
      { message: "El adicional no es válido" },
      { status: 400 },
    );
  }

  try {
    // Los pedidos ya creados conservan su copia del nombre y precio.
    await deleteAddon(addonId);

    return NextResponse.json({ message: "Adicional eliminado" });
  } catch (error) {
    console.error("Error eliminando adicional:", error);

    return NextResponse.json(
      { message: "Error eliminando el adicional" },
      { status: 500 },
    );
  }
}
