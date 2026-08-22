import { NextRequest, NextResponse } from "next/server";
import {
  createNewService,
  listServices,
} from "@/src/modules/services/services/services.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createNewService(body);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Error creando el servicio",
      },
      {
        status: 500,
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
