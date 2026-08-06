import {
  createNewCategory,
  listCategories,
} from "@/src/services/categories.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await listCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Error obteniendo categorías",
        error,
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createNewCategory(body);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Error creando categoría",
      },
      {
        status: 500,
      },
    );
  }
}
