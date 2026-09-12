import type { PoolConnection } from "mysql2/promise";

export interface CreateOrderItemData {
  orderId: number;
  categoryId: number;
  serviceId: number;
  quantity: number;
  width: number | null;
  height: number | null;
  unit: string | null;
  unitPrice: number;
  subtotal: number;
  designFile: string | null;
  observations: string | null;
}

export async function createOrderItem(
  connection: PoolConnection,
  data: CreateOrderItemData,
) {
  const [result] = await connection.query(
    `
      INSERT INTO order_items
      (
        order_id,
        category_id,
        service_id,
        quantity,
        width,
        height,
        unit,
        unit_price,
        subtotal,
        design_file,
        observations
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.orderId,
      data.categoryId,
      data.serviceId,
      data.quantity,
      data.width,
      data.height,
      data.unit,
      data.unitPrice,
      data.subtotal,
      data.designFile,
      data.observations,
    ],
  );

  return result;
}
