import { db } from "@/src/shared/lib/db";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

export type PaymentMethod = "efectivo" | "digital";

export interface CreatePaymentData {
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

export interface FinanceFilters {
  from: string;
  to: string;
  method?: PaymentMethod | null;
}

export async function createPayment(
  connection: PoolConnection,
  data: CreatePaymentData,
) {
  const [result] = await connection.query<ResultSetHeader>(
    `
      INSERT INTO order_payments
      (
        order_id,
        amount,
        payment_method,
        notes
      )
      VALUES (?, ?, ?, ?)
    `,
    [data.orderId, data.amount, data.paymentMethod, data.notes ?? null],
  );

  return result;
}

// El rango es [from, to] inclusive por día: se compara contra la fecha de paid_at.
function buildRangeConditions(filters: FinanceFilters) {
  const conditions = ["DATE(p.paid_at) BETWEEN ? AND ?"];
  const values: (string | number)[] = [filters.from, filters.to];

  if (filters.method) {
    conditions.push("p.payment_method = ?");
    values.push(filters.method);
  }

  return { where: conditions.join(" AND "), values };
}

export async function getFinanceSummary(filters: FinanceFilters) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        COALESCE(SUM(p.amount), 0) AS total,
        COALESCE(SUM(CASE WHEN p.payment_method = 'efectivo' THEN p.amount END), 0) AS cash,
        COALESCE(SUM(CASE WHEN p.payment_method = 'digital' THEN p.amount END), 0) AS digital,
        COUNT(*) AS transactions,
        COUNT(DISTINCT p.order_id) AS orders
      FROM order_payments p
      WHERE ${where}
    `,
    values,
  );

  return rows[0];
}

export async function getDailyBreakdown(filters: FinanceFilters) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        DATE(p.paid_at) AS day,
        COALESCE(SUM(CASE WHEN p.payment_method = 'efectivo' THEN p.amount END), 0) AS cash,
        COALESCE(SUM(CASE WHEN p.payment_method = 'digital' THEN p.amount END), 0) AS digital,
        COALESCE(SUM(p.amount), 0) AS total,
        COUNT(*) AS transactions
      FROM order_payments p
      WHERE ${where}
      GROUP BY DATE(p.paid_at)
      ORDER BY day ASC
    `,
    values,
  );

  return rows;
}

export async function getPayments(filters: FinanceFilters, limit: number) {
  const { where, values } = buildRangeConditions(filters);

  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        p.id,
        p.order_id,
        p.amount,
        p.payment_method,
        p.notes,
        p.paid_at,
        o.customer_type,
        o.total AS order_total,
        COALESCE(c.name_company, o.customer_name) AS customer_name
      FROM order_payments p
      LEFT JOIN orders o ON o.id = p.order_id
      LEFT JOIN company c ON c.id = o.company_id
      WHERE ${where}
      ORDER BY p.paid_at DESC, p.id DESC
      LIMIT ?
    `,
    [...values, limit],
  );

  return rows;
}

export async function getReceivables() {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        COALESCE(SUM(o.total - o.amount_paid), 0) AS pending,
        COUNT(*) AS orders
      FROM orders o
      WHERE o.status <> 'cancelado'
        AND o.total > o.amount_paid
    `,
  );

  return rows[0];
}

export async function getPaymentsByOrder(orderId: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        id,
        amount,
        payment_method,
        notes,
        paid_at
      FROM order_payments
      WHERE order_id = ?
      ORDER BY paid_at DESC, id DESC
    `,
    [orderId],
  );

  return rows;
}
