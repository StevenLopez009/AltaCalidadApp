import { NextResponse } from "next/server";

import {
  editMaterial,
  removeMaterial,
} from "@/src/modules/materials/service/create-material.service";

interface Props {
  params: Promise<{ id: string }>;
}

async function readId({ params }: Props) {
  const { id } = await params;

  const materialId = Number(id);

  return Number.isInteger(materialId) && materialId > 0 ? materialId : null;
}

export async function PUT(request: Request, context: Props) {
  const materialId = await readId(context);

  if (!materialId) {
    return NextResponse.json(
      { message: "El id del material no es válido" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    await editMaterial(materialId, {
      categoryId: Number(body.categoryId),
      name: String(body.name ?? "").trim(),
      description: String(body.description ?? "").trim(),
      unit: String(body.unit ?? ""),
      stock: Number(body.stock) || 0,
      minimumStock: Number(body.minimumStock) || 0,
      unitCost: Number(body.unitCost) || 0,
    });

    return NextResponse.json({ message: "Material actualizado correctamente" });
  } catch (error) {
    console.error("Error actualizando material:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error actualizando el material",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Props) {
  const materialId = await readId(context);

  if (!materialId) {
    return NextResponse.json(
      { message: "El id del material no es válido" },
      { status: 400 },
    );
  }

  try {
    await removeMaterial(materialId);

    return NextResponse.json({ message: "Material eliminado correctamente" });
  } catch (error) {
    console.error("Error eliminando material:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error eliminando el material",
      },
      { status: 400 },
    );
  }
}
