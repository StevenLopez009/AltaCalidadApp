import { NextRequest, NextResponse } from "next/server";
import { createNewService } from "@/src/services/services.service";

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
