import { db } from "@/src/shared/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export const EXPENSE_CATEGORIES = [
  "arriendo",
  "servicios",
  "nomina",
  "materiales",
  "transporte",
  "mantenimiento",
  "impuestos",
  "otros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export type ExpensePaymentMethod = "efectivo" | "digital";

export interface ExpenseData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: ExpensePaymentMethod;
  spentAt: string;
  notes?: string | null;
}

export interface ExpenseFilters {
  from: string;
  to: string;
  category?: ExpenseCategory | null;
}

// El rango es [from, to] inclusive: spent_at es DATE, así que se compara directo.
function buildRangeConditions(filters: ExpenseFilters) {
  const conditions = ["e.spent_at BETWEEN ? AND ?"];
  const values: (string | number)[] = [filters.from, filters.to];

  if (filters.category) {
    conditions.push("e.category = ?");
    values.push(filters.category);
  }

  return { where: conditions.join(" AND "), values };
}

export async function getExpenses(filters: ExpenseFilters) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        e.id,
        e.description,
        e.amount,
        e.category,
        e.payment_method,
        e.spent_at,
        e.notes
      FROM expenses e
      WHERE ${where}
      ORDER BY e.spent_at DESC, e.id DESC
    `,
    values,
  );

  return rows;
}

export async function getExpensesSummary(filters: ExpenseFilters) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        COALESCE(SUM(e.amount), 0) AS total,
        COUNT(*) AS count,
        COALESCE(SUM(CASE WHEN e.payment_method = 'efectivo' THEN e.amount END), 0) AS cash,
        COALESCE(SUM(CASE WHEN e.payment_method = 'digital' THEN e.amount END), 0) AS digital
      FROM expenses e
      WHERE ${where}
    `,
    values,
  );

  return rows[0];
}

export async function getExpensesByCategory(filters: ExpenseFilters) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        e.category,
        COALESCE(SUM(e.amount), 0) AS total,
        COUNT(*) AS count
      FROM expenses e
      WHERE ${where}
      GROUP BY e.category
      ORDER BY total DESC
    `,
    values,
  );

  return rows;
}

export async function getMonthlyBreakdown(filters: ExpenseFilters) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        DATE_FORMAT(e.spent_at, '%Y-%m') AS month,
        COALESCE(SUM(e.amount), 0) AS total,
        COUNT(*) AS count
      FROM expenses e
      WHERE ${where}
      GROUP BY DATE_FORMAT(e.spent_at, '%Y-%m')
      ORDER BY month ASC
    `,
    values,
  );

  return rows;
}

export async function createExpense(data: ExpenseData) {
  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO expenses
      (
        description,
        amount,
        category,
        payment_method,
        spent_at,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.description,
      data.amount,
      data.category,
      data.paymentMethod,
      data.spentAt,
      data.notes ?? null,
    ],
  );

  return result;
}

export async function updateExpense(id: number, data: ExpenseData) {
  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE expenses
      SET
        description = ?,
        amount = ?,
        category = ?,
        payment_method = ?,
        spent_at = ?,
        notes = ?
      WHERE id = ?
    `,
    [
      data.description,
      data.amount,
      data.category,
      data.paymentMethod,
      data.spentAt,
      data.notes ?? null,
      id,
    ],
  );

  return result;
}

export async function deleteExpense(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM expenses WHERE id = ?`,
    [id],
  );

  return result;
}
