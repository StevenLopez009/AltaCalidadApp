import { NextResponse } from "next/server";

import {
  editService,
  removeService,
} from "@/src/modules/services/services/services.service";

interface Props {
  params: Promise<{ id: string }>;
}

async function readId({ params }: Props) {
  const { id } = await params;

  const serviceId = Number(id);

  return Number.isInteger(serviceId) && serviceId > 0 ? serviceId : null;
}

export async function PUT(request: Request, context: Props) {
  const serviceId = await readId(context);

  if (!serviceId) {
    return NextResponse.json(
      { message: "El id del servicio no es válido" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    await editService(serviceId, {
      category_id: Number(body.category_id),
      material_id: body.material_id ? Number(body.material_id) : null,
      material_usage:
        Number(body.material_usage) > 0 ? Number(body.material_usage) : 1,
      name: String(body.name ?? "").trim(),
      description: String(body.description ?? "").trim(),
      unit: String(body.unit ?? ""),
      price: Number(body.price) || 0,
      image: String(body.image ?? ""),
    });

    return NextResponse.json({ message: "Servicio actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando servicio:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error actualizando el servicio",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Props) {
  const serviceId = await readId(context);

  if (!serviceId) {
    return NextResponse.json(
      { message: "El id del servicio no es válido" },
      { status: 400 },
    );
  }

  try {
    await removeService(serviceId);

    return NextResponse.json({ message: "Servicio eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando servicio:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error eliminando el servicio",
      },
      { status: 400 },
    );
  }
}
