import {
  createOrderItem,
  CreateOrderItemData,
} from "../repositories/orderItems.repository";

export async function createNewOrderItem(data: CreateOrderItemData) {
  return await createOrderItem(data);
}
