export interface CreateOrderItemDto {
  orderId: number;
  categoryId: number;
  serviceId: number;
  quantity: number;
  width?: number | null;
  height?: number | null;
  unit: string | null;
  designFile: string | null;
  observations: string | null;
}
