import { createNewOrderItem } from "@/src/modules/order_items/service/orderItems.service";
import { db } from "@/src/shared/lib/db";
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
      designFile,
      observations,
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

    const connection = await db.getConnection();

    try {
      const orderItem = await createNewOrderItem(connection, {
        orderId: Number(orderId),
        categoryId: Number(categoryId),
        serviceId: Number(serviceId),
        quantity: Number(quantity),
        width: width ? Number(width) : null,
        height: height ? Number(height) : null,
        unit: unit ?? null,
        unitPrice: Number(unitPrice) || 0,
        subtotal: Number(subtotal) || 0,
        designFile: designFile ?? null,
        observations: observations ?? null,
      });

      return NextResponse.json(orderItem, {
        status: 201,
      });
    } finally {
      connection.release();
    }
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
