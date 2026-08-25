import { NextRequest, NextResponse } from "next/server";

import { createNewMaterial } from "@/src/modules/materials/service/create-material.service";

import {
  getAllMaterials,
  getMaterialsByCategory,
} from "@/src/modules/materials/repositories/materials.repositories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryIdParam = searchParams.get("categoryId");

    // Si viene categoryId, obtener materiales de esa categoría
    if (categoryIdParam) {
      const categoryId = Number(categoryIdParam);

      if (!categoryId) {
        return NextResponse.json(
          {
            message: "categoryId inválido",
          },
          {
            status: 400,
          },
        );
      }

      const materials = await getMaterialsByCategory(categoryId);

      return NextResponse.json(materials);
    }

    // Si no viene categoryId, obtener todos
    const materials = await getAllMaterials();

    return NextResponse.json(materials);
  } catch (error) {
    console.error("Error obteniendo materiales:", error);

    return NextResponse.json(
      {
        message: "Error obteniendo materiales",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    await createNewMaterial(body);

    return NextResponse.json(
      {
        message: "Material creado correctamente",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error creando material:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      {
        status: 500,
      },
    );
  }
}
