import type { PoolConnection } from "mysql2/promise";

import {
  createOrderItem,
  CreateOrderItemData,
} from "../repositories/orderItems.repository";

export async function createNewOrderItem(
  connection: PoolConnection,
  data: CreateOrderItemData,
) {
  return await createOrderItem(connection, data);
}
