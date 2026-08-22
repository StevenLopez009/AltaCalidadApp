import {
  createNewOrder,
  getAllOrdersData,
  getOrdersCalendar,
  getProductionOrders,
} from "@/src/modules/order/services/orders.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const companyId = formData.get("companyId");
    const deliveryDate = formData.get("deliveryDate");
    const itemsString = formData.get("items");

    if (!companyId) {
      return NextResponse.json(
        {
          message: "El companyId es obligatorio",
        },
        {
          status: 400,
        },
      );
    }

    if (!deliveryDate) {
      return NextResponse.json(
        {
          message: "La fecha de entrega es obligatoria",
        },
        {
          status: 400,
        },
      );
    }

    if (!itemsString || typeof itemsString !== "string") {
      return NextResponse.json(
        {
          message: "Los servicios del pedido son obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    let items;

    try {
      items = JSON.parse(itemsString);
    } catch {
      return NextResponse.json(
        {
          message: "Los servicios enviados no tienen un formato válido",
        },
        {
          status: 400,
        },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          message: "El pedido debe tener al menos un servicio",
        },
        {
          status: 400,
        },
      );
    }
    const order = await createNewOrder({
      companyId: Number(companyId),

      deliveryDate: String(deliveryDate),

      items: items.map((item) => ({
        categoryId: Number(item.categoryId),

        serviceId: Number(item.serviceId),

        quantity: Number(item.quantity),

        width:
          item.width !== null && item.width !== undefined && item.width !== ""
            ? Number(item.width)
            : null,

        height:
          item.height !== null &&
          item.height !== undefined &&
          item.height !== ""
            ? Number(item.height)
            : null,

        unit: item.unit ?? null,

        designFile: item.designFile ?? null,

        observations: item.observations ?? null,
      })),
    });

    return NextResponse.json(
      {
        message: "Pedido creado correctamente",
        order,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("Error creando pedido:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error creando pedido",
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productionQueue = searchParams.get("productionQueue");

    if (productionQueue === "true") {
      const orders = await getProductionOrders();

      return NextResponse.json({
        orders,
      });
    }

    const yearParam = searchParams.get("year");
    const monthParam = searchParams.get("month");

    if (!yearParam && !monthParam) {
      const orders = await getAllOrdersData();

      return NextResponse.json({
        orders,
      });
    }

    const year = Number(yearParam);
    const month = Number(monthParam);

    if (!Number.isInteger(year) || !Number.isInteger(month)) {
      return NextResponse.json(
        {
          message: "El año y el mes son obligatorios",
        },
        {
          status: 400,
        },
      );
    }

    if (month < 1 || month > 12) {
      return NextResponse.json(
        {
          message: "El mes debe estar entre 1 y 12",
        },
        {
          status: 400,
        },
      );
    }

    const orders = await getOrdersCalendar(year, month);

    return NextResponse.json({
      orders,
    });
  } catch (error) {
    console.error("Error obteniendo pedidos:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error obteniendo pedidos",
      },
      {
        status: 500,
      },
    );
  }
}
