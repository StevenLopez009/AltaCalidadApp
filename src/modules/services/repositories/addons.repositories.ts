import { db } from "@/src/shared/lib/db";
import type {
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";

export interface ServiceAddon {
  id: number;
  service_id: number;
  name: string;
  price: number;
}

export async function getAddonsByService(serviceId: number) {
  const [rows] = await db.query<(ServiceAddon & RowDataPacket)[]>(
    `
      SELECT id, service_id, name, price
      FROM service_addons
      WHERE service_id = ?
      ORDER BY name
    `,
    [serviceId],
  );

  return rows;
}

export async function getAllAddons() {
  const [rows] = await db.query<(ServiceAddon & RowDataPacket)[]>(
    `
      SELECT id, service_id, name, price
      FROM service_addons
      ORDER BY service_id, name
    `,
  );

  return rows;
}

export async function getAddonById(id: number) {
  const [rows] = await db.query<(ServiceAddon & RowDataPacket)[]>(
    `SELECT id, service_id, name, price FROM service_addons WHERE id = ? LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
}

export async function createAddon(data: {
  serviceId: number;
  name: string;
  price: number;
}) {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO service_addons (service_id, name, price) VALUES (?, ?, ?)`,
    [data.serviceId, data.name, data.price],
  );

  return result;
}

export async function updateAddon(
  id: number,
  data: { name: string; price: number },
) {
  const [result] = await db.query<ResultSetHeader>(
    `UPDATE service_addons SET name = ?, price = ? WHERE id = ?`,
    [data.name, data.price, id],
  );

  return result;
}

export async function deleteAddon(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM service_addons WHERE id = ?`,
    [id],
  );

  return result;
}

export interface CreateOrderItemAddonData {
  orderItemId: number;
  addonId: number | null;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export async function createOrderItemAddon(
  connection: PoolConnection,
  data: CreateOrderItemAddonData,
) {
  const [result] = await connection.query<ResultSetHeader>(
    `
      INSERT INTO order_item_addons
        (order_item_id, addon_id, name, unit_price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.orderItemId,
      data.addonId,
      data.name,
      data.unitPrice,
      data.quantity,
      data.subtotal,
    ],
  );

  return result;
}

export async function getAddonsForOrder(orderId: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        oia.id,
        oia.order_item_id,
        oia.name,
        oia.unit_price,
        oia.quantity,
        oia.subtotal
      FROM order_item_addons oia
      JOIN order_items oi ON oi.id = oia.order_item_id
      WHERE oi.order_id = ?
      ORDER BY oia.id
    `,
    [orderId],
  );

  return rows;
}
