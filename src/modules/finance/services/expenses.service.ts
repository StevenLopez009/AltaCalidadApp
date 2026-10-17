import {
  createExpense,
  deleteExpense,
  getExpenses,
  getExpensesByCategory,
  getExpensesSummary,
  getMonthlyBreakdown,
  updateExpense,
  EXPENSE_CATEGORIES,
  type ExpenseCategory,
  type ExpenseData,
  type ExpenseFilters,
  type ExpensePaymentMethod,
} from "../repositories/expenses.repositories";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const MAX_DESCRIPTION = 160;
const MAX_NOTES = 255;

export function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
}

function toDayString(value: unknown) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

/**
 * Valida y normaliza lo que llega del cliente. Devuelve el error en vez de
 * lanzarlo para que la ruta responda 400 con un mensaje util al usuario.
 */
export function parseExpenseInput(
  body: Record<string, unknown>,
): { data: ExpenseData } | { error: string } {
  const description = String(body.description ?? "").trim();

  if (!description) {
    return { error: "La descripción del gasto es obligatoria" };
  }

  if (description.length > MAX_DESCRIPTION) {
    return {
      error: `La descripción no puede superar ${MAX_DESCRIPTION} caracteres`,
    };
  }

  const amount = Number(body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "El monto debe ser mayor a cero" };
  }

  const category = body.category ?? "otros";

  if (!isExpenseCategory(category)) {
    return { error: "La categoría del gasto no es válida" };
  }

  const paymentMethod = String(
    body.payment_method ?? "efectivo",
  ) as ExpensePaymentMethod;

  if (paymentMethod !== "efectivo" && paymentMethod !== "digital") {
    return { error: "El método de pago no es válido" };
  }

  const spentAt = String(body.spent_at ?? "");

  if (!isValidDate(spentAt)) {
    return { error: "La fecha debe tener el formato AAAA-MM-DD" };
  }

  const rawNotes = String(body.notes ?? "").trim();

  if (rawNotes.length > MAX_NOTES) {
    return { error: `Las notas no pueden superar ${MAX_NOTES} caracteres` };
  }

  return {
    data: {
      description,
      amount,
      category,
      paymentMethod,
      spentAt,
      notes: rawNotes || null,
    },
  };
}

export async function getExpensesReport(filters: ExpenseFilters) {
  const [expenses, summary, byCategory, monthly] = await Promise.all([
    getExpenses(filters),
    getExpensesSummary(filters),
    getExpensesByCategory(filters),
    getMonthlyBreakdown(filters),
  ]);

  const total = Number(summary?.total) || 0;

  return {
    range: {
      from: filters.from,
      to: filters.to,
      category: filters.category ?? null,
    },

    summary: {
      total,
      count: Number(summary?.count) || 0,
      cash: Number(summary?.cash) || 0,
      digital: Number(summary?.digital) || 0,
      average: Number(summary?.count) > 0 ? total / Number(summary.count) : 0,
    },

    byCategory: byCategory.map((row) => ({
      category: row.category as ExpenseCategory,
      total: Number(row.total) || 0,
      count: Number(row.count) || 0,
      share: total > 0 ? (Number(row.total) / total) * 100 : 0,
    })),

    monthly: monthly.map((row) => ({
      month: String(row.month),
      total: Number(row.total) || 0,
      count: Number(row.count) || 0,
    })),

    expenses: expenses.map((row) => ({
      id: Number(row.id),
      description: row.description as string,
      amount: Number(row.amount) || 0,
      category: row.category as ExpenseCategory,
      paymentMethod: row.payment_method as ExpensePaymentMethod,
      spentAt: toDayString(row.spent_at),
      notes: row.notes as string | null,
    })),
  };
}

export async function registerExpense(data: ExpenseData) {
  const result = await createExpense(data);

  return { id: result.insertId, ...data };
}

export async function editExpense(id: number, data: ExpenseData) {
  const result = await updateExpense(id, data);

  if (result.affectedRows === 0) {
    throw new Error("El gasto no existe");
  }

  return { id, ...data };
}

export async function removeExpense(id: number) {
  const result = await deleteExpense(id);

  if (result.affectedRows === 0) {
    throw new Error("El gasto no existe");
  }

  return { id };
}
