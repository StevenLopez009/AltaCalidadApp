import { NextResponse } from "next/server";

import {
  editCategory,
  removeCategory,
} from "@/src/modules/categories/services/categories.service";

interface Props {
  params: Promise<{ id: string }>;
}

async function readId({ params }: Props) {
  const { id } = await params;

  const categoryId = Number(id);

  return Number.isInteger(categoryId) && categoryId > 0 ? categoryId : null;
}

export async function PUT(request: Request, context: Props) {
  const categoryId = await readId(context);

  if (!categoryId) {
    return NextResponse.json(
      { message: "El id de la categoría no es válido" },
      { status: 400 },
    );
  }

  try {
    const body = await request.json();

    await editCategory(categoryId, {
      name: String(body.name ?? ""),
      description: String(body.description ?? ""),
      image: String(body.image ?? ""),
    });

    return NextResponse.json({
      message: "Categoría actualizada correctamente",
    });
  } catch (error) {
    console.error("Error actualizando categoría:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error actualizando la categoría",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, context: Props) {
  const categoryId = await readId(context);

  if (!categoryId) {
    return NextResponse.json(
      { message: "El id de la categoría no es válido" },
      { status: 400 },
    );
  }

  try {
    await removeCategory(categoryId);

    return NextResponse.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error eliminando categoría:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error eliminando la categoría",
      },
      { status: 400 },
    );
  }
}
