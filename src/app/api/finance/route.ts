import { NextResponse } from "next/server";

import { getFinanceReport } from "@/src/modules/finance/services/finance.service";
import type { PaymentMethod } from "@/src/modules/finance/repositories/finance.repositories";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MAX_RANGE_DAYS = 366;

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);

  return !Number.isNaN(date.getTime());
}

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
    const methodParam = searchParams.get("method");

    if (!isValidDate(from) || !isValidDate(to)) {
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

    const rangeDays =
      (new Date(`${to}T00:00:00`).getTime() -
        new Date(`${from}T00:00:00`).getTime()) /
        86_400_000 +
      1;

    if (rangeDays > MAX_RANGE_DAYS) {
      return NextResponse.json(
        { message: "El rango no puede superar un año" },
        { status: 400 },
      );
    }

    let method: PaymentMethod | null = null;

    if (methodParam && methodParam !== "todos") {
      if (methodParam !== "efectivo" && methodParam !== "digital") {
        return NextResponse.json(
          { message: "El método de pago no es válido" },
          { status: 400 },
        );
      }

      method = methodParam;
    }

    const report = await getFinanceReport({ from, to, method });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error obteniendo el reporte financiero:", error);

    return NextResponse.json(
      { message: "Error obteniendo el reporte financiero" },
      { status: 500 },
    );
  }
}
