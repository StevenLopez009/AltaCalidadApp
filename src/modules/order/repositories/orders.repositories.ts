import { db } from "@/src/shared/lib/db";
import type { PoolConnection } from "mysql2/promise";

export type CustomerType = "empresa" | "usuario";

export interface CreateOrderData {
  companyId: number | null;
  customerType: CustomerType;
  customerName: string | null;
  customerPhone: string | null;

  deliveryDate: string;
  status: "pendiente";
  observations?: string | null;
  designFile?: string | null;

  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
}

export async function createOrder(
  connection: PoolConnection,
  data: CreateOrderData,
) {
  const [result] = await connection.query(
    `
      INSERT INTO orders
      (
        company_id,
        customer_type,
        customer_name,
        customer_phone,
        delivery_date,
        status,
        subtotal,
        discount_percentage,
        discount_amount,
        total,
        design_file,
        observations
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.companyId,
      data.customerType,
      data.customerName,
      data.customerPhone,
      data.deliveryDate,
      data.status,
      data.subtotal,
      data.discountPercentage,
      data.discountAmount,
      data.total,
      data.designFile,
      data.observations,
    ],
  );

  return result;
}

export async function getOrderById(id: number) {
  const [rows] = await db.query(
    `
      SELECT *
      FROM orders
      WHERE id = ?
      LIMIT 1
    `,
    [id],
  );

  return (rows as any[])[0] ?? null;
}

export async function getOrdersByMonth(year: number, month: number) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const [rows] = await db.query(
    `
      SELECT
        id,
        delivery_date,
        status
      FROM orders
      WHERE delivery_date >= ?
        AND delivery_date < ?
      ORDER BY delivery_date ASC
    `,
    [startDate, endDate],
  );

  return rows;
}

export async function getProductionQueue() {
  const [rows] = await db.query(`
    SELECT 
      o.id,
      o.company_id,
      o.delivery_date,
      o.status,
      o.total,
      c.name_company AS company_name,

      GROUP_CONCAT(
        DISTINCT s.name
        ORDER BY s.name
        SEPARATOR ', '
      ) AS services

    FROM orders o

    LEFT JOIN company c
      ON c.id = o.company_id

    LEFT JOIN order_items oi
      ON oi.order_id = o.id

    LEFT JOIN services s
      ON s.id = oi.service_id

    WHERE o.status IN ('pendiente', 'en_produccion')

    GROUP BY
      o.id,
      o.company_id,
      o.delivery_date,
      o.status,
      o.total,
      c.name_company

    ORDER BY o.delivery_date ASC
  `);

  return rows;
}

export async function getOrderDetailsById(id: number) {
  const [rows] = await db.query(
    `
      SELECT 
        o.id,
        o.company_id,
        c.name_company AS company_name,
        o.delivery_date,
        o.status,

        o.payment_status,
        o.amount_paid,

        o.subtotal,
        o.discount_percentage,
        o.discount_amount,
        o.total,

        o.design_file,
        o.observations,
        o.created_at,
        o.updated_at,

        oi.id AS item_id,
        oi.category_id,
        oi.service_id,
        oi.quantity,
        oi.width,
        oi.height,
        oi.unit,
        oi.unit_price,
        oi.subtotal AS item_subtotal,
        oi.design_file AS item_design_file,
        oi.observations AS item_observations,

        s.name AS service_name

      FROM orders o

      LEFT JOIN company c
        ON c.id = o.company_id

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      LEFT JOIN services s
        ON s.id = oi.service_id

      WHERE o.id = ?

      ORDER BY oi.id ASC
    `,
    [id],
  );

  return rows;
}

export async function updateOrderStatus(
  id: number,
  status:
    | "pendiente"
    | "en_produccion"
    | "terminado"
    | "entregado"
    | "cancelado",
) {
  const [result] = await db.query(
    `
      UPDATE orders
      SET status = ?
      WHERE id = ?
    `,
    [status, id],
  );

  return result;
}

export async function updateOrderPaymentStatus(
  id: number,
  paymentStatus: "pendiente" | "pago_parcial" | "pagado",
) {
  const [result] = await db.query(
    `
      UPDATE orders
      SET payment_status = ?
      WHERE id = ?
    `,
    [paymentStatus, id],
  );

  return result;
}

export async function getAllOrders() {
  const [rows] = await db.query(`
    SELECT
      o.id,
      o.company_id,
      o.customer_type,
      c.name_company AS company_name,
      o.customer_name,
      o.customer_phone,
      o.delivery_date,
      o.status,
      o.payment_status,
      o.amount_paid,
      o.total,
      GROUP_CONCAT(
        DISTINCT s.name
        ORDER BY s.name
        SEPARATOR ', '
      ) AS services
    FROM orders o
    LEFT JOIN company c
      ON c.id = o.company_id
    LEFT JOIN order_items oi
      ON oi.order_id = o.id
    LEFT JOIN services s
      ON s.id = oi.service_id
    GROUP BY
      o.id,
      o.company_id,
      o.customer_type,
      c.name_company,
      o.customer_name,
      o.customer_phone,
      o.delivery_date,
      o.status,
      o.payment_status,
      o.amount_paid,
      o.total
    ORDER BY o.delivery_date ASC
  `);

  return rows;
}

export async function updateOrderPayment(id: number, amountPaid: number) {
  const [result] = await db.query(
    `
      UPDATE orders
      SET
        amount_paid = amount_paid + ?,
        payment_status = CASE
          WHEN amount_paid + ? <= 0 THEN 'pendiente'
          WHEN amount_paid + ? >= total THEN 'pagado'
          ELSE 'pago_parcial'
        END
      WHERE id = ?
    `,
    [amountPaid, amountPaid, amountPaid, id],
  );

  return result;
}
