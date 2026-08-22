import {
  changeOrderPayment,
  changeOrderPaymentStatus,
  changeOrderStatus,
  getOrderDetails,
} from "@/src/modules/order/services/orders.service";

import { NextResponse } from "next/server";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

type OrderStatus =
  | "pendiente"
  | "en_produccion"
  | "terminado"
  | "entregado"
  | "cancelado";

type PaymentStatus = "pendiente" | "pago_parcial" | "pagado";

// ============================================================
// GET
// ============================================================

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const orderId = Number(id);

    // ========================================================
    // VALIDAR ID
    // ========================================================

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          message: "El ID del pedido no es válido",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // OBTENER PEDIDO
    // ========================================================

    const order = await getOrderDetails(orderId);

    if (!order) {
      return NextResponse.json(
        {
          message: "El pedido no existe",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      order,
    });
  } catch (error) {
    console.error("Error obteniendo detalle del pedido:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error obteniendo pedido",
      },
      {
        status: 500,
      },
    );
  }
}

// ============================================================
// PATCH
// ============================================================

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params;

    const orderId = Number(id);

    // ========================================================
    // VALIDAR ID
    // ========================================================

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        {
          message: "El ID del pedido no es válido",
        },
        {
          status: 400,
        },
      );
    }

    // ========================================================
    // LEER BODY
    // ========================================================

    const body = await request.json();

    // ========================================================
    // ACTUALIZAR ESTADO DEL PEDIDO
    // ========================================================

    if (body.status !== undefined) {
      const status = body.status as OrderStatus;

      const validStatuses: OrderStatus[] = [
        "pendiente",
        "en_produccion",
        "terminado",
        "entregado",
        "cancelado",
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            message: "El estado del pedido no es válido",
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // VERIFICAR PEDIDO
      // ------------------------------------------------------

      const order = await getOrderDetails(orderId);

      if (!order) {
        return NextResponse.json(
          {
            message: "El pedido no existe",
          },
          {
            status: 404,
          },
        );
      }

      // ------------------------------------------------------
      // ACTUALIZAR
      // ------------------------------------------------------

      await changeOrderStatus(orderId, status);

      return NextResponse.json({
        message: "Estado del pedido actualizado correctamente",

        status,
      });
    }

    // ========================================================
    // ACTUALIZAR ABONO
    // ========================================================

    if (body.amount_paid !== undefined) {
      const amountPaid = Number(body.amount_paid);

      // ------------------------------------------------------
      // VALIDAR ABONO
      // ------------------------------------------------------

      if (!Number.isFinite(amountPaid) || amountPaid < 0) {
        return NextResponse.json(
          {
            message: "El valor del abono no es válido",
          },
          {
            status: 400,
          },
        );
      }

      try {
        // ----------------------------------------------------
        // EL SERVICE SE ENCARGA DE:
        //
        // 1. Verificar que exista el pedido
        // 2. Obtener el total
        // 3. Verificar que no pague más del total
        // 4. Determinar payment_status
        // 5. Guardar amount_paid
        // 6. Guardar payment_status
        // ----------------------------------------------------

        const result = await changeOrderPayment(orderId, amountPaid);

        return NextResponse.json({
          message: "Pago actualizado correctamente",

          order: result,
        });
      } catch (error) {
        return NextResponse.json(
          {
            message:
              error instanceof Error
                ? error.message
                : "No se pudo actualizar el pago",
          },
          {
            status: 400,
          },
        );
      }
    }

    // ========================================================
    // ACTUALIZAR ESTADO DE PAGO MANUALMENTE
    // ========================================================

    if (body.payment_status !== undefined) {
      const paymentStatus = body.payment_status as PaymentStatus;

      const validPaymentStatuses: PaymentStatus[] = [
        "pendiente",
        "pago_parcial",
        "pagado",
      ];

      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          {
            message: "El estado de pago no es válido",
          },
          {
            status: 400,
          },
        );
      }

      // ------------------------------------------------------
      // VERIFICAR PEDIDO
      // ------------------------------------------------------

      const order = await getOrderDetails(orderId);

      if (!order) {
        return NextResponse.json(
          {
            message: "El pedido no existe",
          },
          {
            status: 404,
          },
        );
      }

      // ------------------------------------------------------
      // ACTUALIZAR
      // ------------------------------------------------------

      await changeOrderPaymentStatus(orderId, paymentStatus);

      return NextResponse.json({
        message: "Estado de pago actualizado correctamente",

        payment_status: paymentStatus,
      });
    }

    // ========================================================
    // NINGÚN CAMPO VÁLIDO
    // ========================================================

    return NextResponse.json(
      {
        message: "No se proporcionó un campo válido para actualizar",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error("Error actualizando pedido:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Error actualizando pedido",
      },
      {
        status: 500,
      },
    );
  }
}
