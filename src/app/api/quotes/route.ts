import { createNewQuote } from "@/src/modules/quotes/services/quotes.service";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await createNewQuote(body);

    return NextResponse.json(result, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Error creando cotización",
      },
      {
        status: 500,
      },
    );
  }
}
