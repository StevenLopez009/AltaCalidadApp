import { NextRequest, NextResponse } from "next/server";
import {
  createNewService,
  listServices,
} from "@/src/modules/services/services/services.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createNewService({
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

    // El id permite crear los adicionales del servicio recién guardado.
    return NextResponse.json(
      { message: "Servicio creado correctamente", id: result.insertId },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Error creando el servicio",
      },
      {
        status: 400,
      },
    );
  }
}

export async function GET() {
  try {
    const services = await listServices();

    return NextResponse.json(services);
  } catch (error) {
    console.error("Error obteniendo servicios:", error);

    return NextResponse.json(
      {
        message: "Error obteniendo servicios",
      },
      {
        status: 500,
      },
    );
  }
}
