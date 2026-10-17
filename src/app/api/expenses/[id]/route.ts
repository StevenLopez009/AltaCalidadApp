import { NextResponse } from "next/server";

import {
  editExpense,
  parseExpenseInput,
  removeExpense,
} from "@/src/modules/finance/services/expenses.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

async function resolveId(params: Props["params"]) {
  const { id } = await params;

  const expenseId = Number(id);

  return Number.isInteger(expenseId) && expenseId > 0 ? expenseId : null;
}

// ============================================================
// EDITAR
// ============================================================

export async function PATCH(request: Request, { params }: Props) {
  try {
    const expenseId = await resolveId(params);

    if (expenseId === null) {
      return NextResponse.json(
        { message: "El identificador del gasto no es válido" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const parsed = parseExpenseInput(body);

    if ("error" in parsed) {
      return NextResponse.json({ message: parsed.error }, { status: 400 });
    }

    const expense = await editExpense(expenseId, parsed.data);

    return NextResponse.json({
      message: "Gasto actualizado correctamente",
      expense,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error actualizando el gasto";

    const status = message === "El gasto no existe" ? 404 : 500;

    if (status === 500) {
      console.error("Error actualizando el gasto:", error);
    }

    return NextResponse.json({ message }, { status });
  }
}

// ============================================================
// ELIMINAR
// ============================================================

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const expenseId = await resolveId(params);

    if (expenseId === null) {
      return NextResponse.json(
        { message: "El identificador del gasto no es válido" },
        { status: 400 },
      );
    }

    await removeExpense(expenseId);

    return NextResponse.json({ message: "Gasto eliminado correctamente" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error eliminando el gasto";

    const status = message === "El gasto no existe" ? 404 : 500;

    if (status === 500) {
      console.error("Error eliminando el gasto:", error);
    }

    return NextResponse.json({ message }, { status });
  }
}
