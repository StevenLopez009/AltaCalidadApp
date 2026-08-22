import { createNewOrderItem } from "@/src/modules/order_items/services/orderItems.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      orderId,
      categoryId,
      serviceId,
      quantity,
      width,
      height,
      unit,
      unitPrice,
      subtotal,
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { message: "El orderId es obligatorio" },
        { status: 400 },
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { message: "El categoryId es obligatorio" },
        { status: 400 },
      );
    }

    if (!serviceId) {
      return NextResponse.json(
        { message: "El serviceId es obligatorio" },
        { status: 400 },
      );
    }

    if (!quantity) {
      return NextResponse.json(
        { message: "La cantidad es obligatoria" },
        { status: 400 },
      );
    }

    const orderItem = await createNewOrderItem({
      orderId: Number(orderId),
      categoryId: Number(categoryId),
      serviceId: Number(serviceId),
      quantity: Number(quantity),
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      unit,
      unitPrice: Number(unitPrice),
      subtotal: Number(subtotal),
    });

    return NextResponse.json(orderItem, {
      status: 201,
    });
  } catch (error) {
    console.error("Error creando order item:", error);

    return NextResponse.json(
      {
        message: "Error creando el detalle del pedido",
      },
      {
        status: 500,
      },
    );
  }
}
