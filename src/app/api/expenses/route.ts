import { NextResponse } from "next/server";

import {
  getExpensesReport,
  isExpenseCategory,
  isValidDate,
  parseExpenseInput,
  registerExpense,
} from "@/src/modules/finance/services/expenses.service";
import type { ExpenseCategory } from "@/src/modules/finance/repositories/expenses.repositories";

const MAX_RANGE_DAYS = 366 * 3;

function defaultRange() {
  const today = new Date();

  return {
    from: new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    to: today.toISOString().slice(0, 10),
  };
}

// ============================================================
// LISTAR
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const fallback = defaultRange();

    const from = searchParams.get("from") ?? fallback.from;
    const to = searchParams.get("to") ?? fallback.to;
    const categoryParam = searchParams.get("category");

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
        { message: "El rango no puede superar tres años" },
        { status: 400 },
      );
    }

    let category: ExpenseCategory | null = null;

    if (categoryParam && categoryParam !== "todas") {
      if (!isExpenseCategory(categoryParam)) {
        return NextResponse.json(
          { message: "La categoría no es válida" },
          { status: 400 },
        );
      }

      category = categoryParam;
    }

    const report = await getExpensesReport({ from, to, category });

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error obteniendo los gastos:", error);

    return NextResponse.json(
      { message: "Error obteniendo los gastos" },
      { status: 500 },
    );
  }
}

// ============================================================
// CREAR
// ============================================================

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = parseExpenseInput(body);

    if ("error" in parsed) {
      return NextResponse.json({ message: parsed.error }, { status: 400 });
    }

    const expense = await registerExpense(parsed.data);

    return NextResponse.json(
      { message: "Gasto registrado correctamente", expense },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error registrando el gasto:", error);

    return NextResponse.json(
      { message: "Error registrando el gasto" },
      { status: 500 },
    );
  }
}
