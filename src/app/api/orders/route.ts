import {
  createNewOrder,
  getAllOrdersData,
  getOrdersCalendar,
  getProductionOrders,
  getOrdersForDeliveryDate,
} from "@/src/modules/order/services/orders.service";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const customerType = formData.get("customerType");
    const companyId = formData.get("companyId");
    const customerName = formData.get("customerName");
    const customerPhone = formData.get("customerPhone");
    const deliveryDate = formData.get("deliveryDate");
    const itemsString = formData.get("items");

    if (customerType !== "empresa" && customerType !== "usuario") {
      return NextResponse.json(
        {
          message: "El tipo de cliente es obligatorio",
        },
        {
          status: 400,
        },
      );
    }

    if (customerType === "empresa") {
      if (!companyId) {
        return NextResponse.json(
          {
            message: "La empresa es obligatoria",
          },
          {
            status: 400,
          },
        );
      }
    }

    if (customerType === "usuario") {
      if (!customerName || typeof customerName !== "string") {
        return NextResponse.json(
          {
            message: "El nombre del cliente es obligatorio",
          },
          {
            status: 400,
          },
        );
      }

      if (!customerPhone || typeof customerPhone !== "string") {
        return NextResponse.json(
          {
            message: "El teléfono del cliente es obligatorio",
          },
          {
            status: 400,
          },
        );
      }
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

    // ----------------------------------------------------------
    // ABONO INICIAL (opcional)
    // ----------------------------------------------------------

    const paymentAmountRaw = formData.get("paymentAmount");
    const paymentMethodRaw = formData.get("paymentMethod");

    let payment: { amount: number; method: "efectivo" | "digital" } | null =
      null;

    if (paymentAmountRaw) {
      const amount = Number(paymentAmountRaw);

      if (!Number.isFinite(amount) || amount <= 0) {
        return NextResponse.json(
          {
            message: "El monto del pago no es válido",
          },
          {
            status: 400,
          },
        );
      }

      const method = String(paymentMethodRaw ?? "efectivo");

      if (method !== "efectivo" && method !== "digital") {
        return NextResponse.json(
          {
            message: "El método de pago no es válido",
          },
          {
            status: 400,
          },
        );
      }

      payment = { amount, method };
    }

    const order = await createNewOrder({
      payment,

      customerType,
      companyId: customerType === "empresa" ? Number(companyId) : null,

      customerName:
        customerType === "usuario" ? String(customerName).trim() : null,

      customerPhone:
        customerType === "usuario" ? String(customerPhone).trim() : null,

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

        addons: Array.isArray(item.addons)
          ? item.addons.map((addon: { addonId: number; quantity: number }) => ({
              addonId: Number(addon.addonId),
              quantity: Number(addon.quantity),
            }))
          : [],
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

    const dateParam = searchParams.get("date");

    if (dateParam) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return NextResponse.json(
          {
            message: "La fecha debe tener el formato AAAA-MM-DD",
          },
          {
            status: 400,
          },
        );
      }

      const orders = await getOrdersForDeliveryDate(dateParam);

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
