import { NextResponse } from "next/server";

import { getProfitReport } from "@/src/modules/finance/services/profit.service";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MAX_RANGE_DAYS = 366;

function defaultRange() {
  const to = new Date();

  const from = new Date();
  from.setDate(from.getDate() - 29);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const fallback = defaultRange();

    const from = searchParams.get("from") ?? fallback.from;
    const to = searchParams.get("to") ?? fallback.to;

    if (!DATE_PATTERN.test(from) || !DATE_PATTERN.test(to)) {
      return NextResponse.json(
        { message: "Las fechas deben tener el formato AAAA-MM-DD" },
        { status: 400 },
      );
    }

    if (from > to) {
      return NextResponse.json(
        { message: "La fecha inicial no puede ser mayor a la final" },
        { status: 400 },
      );
    }

    const days =
      (new Date(`${to}T00:00:00`).getTime() -
        new Date(`${from}T00:00:00`).getTime()) /
        86_400_000 +
      1;

    if (days > MAX_RANGE_DAYS) {
      return NextResponse.json(
        { message: "El rango no puede superar un año" },
        { status: 400 },
      );
    }

    return NextResponse.json(await getProfitReport({ from, to }));
  } catch (error) {
    console.error("Error obteniendo el reporte de ganancias:", error);

    return NextResponse.json(
      { message: "Error obteniendo el reporte de ganancias" },
      { status: 500 },
    );
  }
}
