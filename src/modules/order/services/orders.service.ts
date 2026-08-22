import { getCompanyById } from "@/src/modules/company/repositories/company.repositories";
import { getServiceById } from "../../services/repositories/services.repositories";
import {
  createOrder,
  getOrderDetailsById,
  getOrdersByMonth,
  getProductionQueue,
  updateOrderStatus,
  updateOrderPaymentStatus,
  updateOrderPayment,
  getAllOrders,
} from "../repositories/orders.repositories";
import { createNewOrderItem } from "../../order_items/service/orderItems.service";

interface CreateOrderItemData {
  categoryId: number;
  serviceId: number;
  quantity: number;
  width: number | null;
  height: number | null;
  unit: string | null;
  designFile: string | null;
  observations: string | null;
}

interface CreateNewOrderData {
  companyId: number;
  deliveryDate: string;
  items: CreateOrderItemData[];
}

export async function createNewOrder(data: CreateNewOrderData) {
  const company = await getCompanyById(data.companyId);

  if (!company) {
    throw new Error("La empresa no existe");
  }

  const discountPercentage = Number(company.discount_percentage) || 0;
  let subtotal = 0;

  for (const item of data.items) {
    const service = await getServiceById(item.serviceId);

    if (!service) {
      throw new Error(`El servicio con id ${item.serviceId} no existe`);
    }

    const quantity = Number(item.quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("La cantidad debe ser mayor a cero");
    }

    const price = Number(service.price);

    if (!Number.isFinite(price)) {
      throw new Error(`El precio del servicio ${service.name} no es válido`);
    }

    const width = Number(item.width) || 0;
    const height = Number(item.height) || 0;

    let itemSubtotal = 0;

    if (service.unit === "m2") {
      if (width <= 0 || height <= 0) {
        throw new Error(`El servicio ${service.name} requiere base y altura`);
      }
      itemSubtotal = width * height * quantity * price;
    } else if (service.unit === "metro") {
      if (width <= 0) {
        throw new Error(`El servicio ${service.name} requiere una medida`);
      }

      itemSubtotal = width * quantity * price;
    } else {
      itemSubtotal = quantity * price;
    }

    subtotal += itemSubtotal;
  }

  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount;

  const order = await createOrder({
    companyId: data.companyId,
    deliveryDate: data.deliveryDate,
    status: "pendiente",
    subtotal,
    discountPercentage,
    discountAmount,
    total,
    designFile: null,
    observations: null,
  });

  const orderId = (order as any).insertId;

  for (const item of data.items) {
    const service = await getServiceById(item.serviceId);

    if (!service) {
      throw new Error(`El servicio con id ${item.serviceId} no existe`);
    }

    await createNewOrderItem({
      orderId,
      categoryId: item.categoryId,
      serviceId: item.serviceId,
      quantity: item.quantity,
      width: item.width,
      height: item.height,
      unit: service.unit,
      designFile: item.designFile,
      observations: item.observations,
    });
  }

  return order;
}

export async function getOrdersCalendar(year: number, month: number) {
  return await getOrdersByMonth(year, month);
}

export async function getProductionOrders() {
  return await getProductionQueue();
}

export async function getAllOrdersData() {
  return await getAllOrders();
}

export async function getOrderDetails(id: number) {
  const rows = await getOrderDetailsById(id);

  if (!rows || rows.length === 0) {
    return null;
  }

  const firstRow = rows[0] as any;

  return {
    id: firstRow.id,
    companyId: firstRow.company_id,
    companyName: firstRow.company_name,
    deliveryDate: firstRow.delivery_date,
    status: firstRow.status,
    paymentStatus: firstRow.payment_status,
    amountPaid: Number(firstRow.amount_paid) || 0,
    subtotal: firstRow.subtotal,
    discountPercentage: firstRow.discount_percentage,
    discountAmount: firstRow.discount_amount,
    total: firstRow.total,
    designFile: firstRow.design_file,
    observations: firstRow.observations,
    createdAt: firstRow.created_at,
    updatedAt: firstRow.updated_at,

    items: rows
      .filter((row: any) => row.item_id !== null)
      .map((row: any) => ({
        id: row.item_id,
        categoryId: row.category_id,
        serviceId: row.service_id,
        serviceName: row.service_name,
        quantity: row.quantity,
        width: row.width,
        height: row.height,
        unit: row.unit,
        unitPrice: row.unit_price,
        subtotal: row.item_subtotal,
        designFile: row.item_design_file,
        observations: row.item_observations,
      })),
  };
}

export async function changeOrderStatus(
  id: number,
  status:
    | "pendiente"
    | "en_produccion"
    | "terminado"
    | "entregado"
    | "cancelado",
) {
  return await updateOrderStatus(id, status);
}

export async function changeOrderPaymentStatus(
  id: number,
  paymentStatus: "pendiente" | "pago_parcial" | "pagado",
) {
  return await updateOrderPaymentStatus(id, paymentStatus);
}

export async function changeOrderPayment(id: number, amountPaid: number) {
  // ========================================================
  // OBTENER PEDIDO
  // ========================================================

  const rows = await getOrderDetailsById(id);

  if (!rows || rows.length === 0) {
    throw new Error("El pedido no existe");
  }

  const firstRow = rows[0] as any;

  // ========================================================
  // OBTENER VALORES ACTUALES
  // ========================================================

  const total = Number(firstRow.total) || 0;
  const currentAmountPaid = Number(firstRow.amount_paid) || 0;

  // ========================================================
  // VALIDAR ABONO
  // ========================================================

  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    throw new Error("El monto del abono debe ser mayor a cero");
  }

  // ========================================================
  // CALCULAR SALDO ACTUAL
  // ========================================================

  const amountDue = Math.max(total - currentAmountPaid, 0);

  // ========================================================
  // VALIDAR QUE EL NUEVO ABONO NO SUPERE EL SALDO
  // ========================================================

  if (amountPaid > amountDue) {
    throw new Error(
      `El abono no puede ser mayor al saldo pendiente de $${amountDue.toLocaleString(
        "es-CO",
      )}`,
    );
  }

  // ========================================================
  // ACTUALIZAR PAGO
  // ========================================================

  await updateOrderPayment(id, amountPaid);

  // ========================================================
  // OBTENER PEDIDO ACTUALIZADO
  // ========================================================

  const updatedRows = await getOrderDetailsById(id);

  if (!updatedRows || updatedRows.length === 0) {
    throw new Error("No se pudo obtener el pedido actualizado");
  }

  const updatedOrder = updatedRows[0] as any;

  const updatedAmountPaid = Number(updatedOrder.amount_paid) || 0;

  const updatedTotal = Number(updatedOrder.total) || 0;

  const updatedAmountDue = Math.max(updatedTotal - updatedAmountPaid, 0);

  return {
    amountPaid: updatedAmountPaid,
    amountDue: updatedAmountDue,
    paymentStatus: updatedOrder.payment_status,
  };
}
