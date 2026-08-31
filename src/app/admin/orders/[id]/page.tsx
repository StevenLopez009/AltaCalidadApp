"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OrderItem {
  id: number;
  categoryId: number;
  serviceId: number;
  serviceName: string;
  quantity: number;
  width: number | null;
  height: number | null;
  unit: string;
  unitPrice: number;
  subtotal: number;
  designFile: string | null;
  observations: string | null;
}

type PaymentStatus = "pendiente" | "pago_parcial" | "pagado";

interface Order {
  id: number;
  companyId: number;
  deliveryDate: string;
  status: string;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  total: number;
  designFile: string | null;
  observations: string | null;
  companyName: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const params = useParams();

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAmountPaid, setUpdatingAmountPaid] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [amountPaid, setAmountPaid] = useState("");

  const orderStatuses = [
    {
      value: "pendiente",
      label: "Pendiente",
    },
    {
      value: "en_produccion",
      label: "En producción",
    },
    {
      value: "terminado",
      label: "Terminado",
    },
    {
      value: "entregado",
      label: "Entregado",
    },
    {
      value: "cancelado",
      label: "Cancelado",
    },
  ] as const;

  /**
   * Determina automáticamente el estado del pago
   * según el total y el abono.
   */
  const getPaymentStatus = (paid: number, total: number): PaymentStatus => {
    if (paid <= 0) {
      return "pendiente";
    }

    if (paid >= total) {
      return "pagado";
    }

    return "pago_parcial";
  };

  /**
   * Actualizar estado del pedido
   */
  async function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>,
  ) {
    if (!order) return;

    const newStatus = event.target.value;

    try {
      setUpdatingStatus(true);

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado");
      }

      setOrder({
        ...order,
        status: newStatus,
      });
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del pedido",
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAmountPaidChange() {
    if (!order) return;

    const paid = Number(amountPaid);
    const total = Number(order.total) || 0;

    // Validar número
    if (!Number.isFinite(paid) || paid < 0) {
      alert("Ingrese un valor de abono válido.");
      return;
    }

    // Evitar abonos mayores al total
    if (paid > total) {
      alert("El abono no puede ser mayor al total del pedido.");
      return;
    }

    // Calcular estado automáticamente
    const newPaymentStatus = getPaymentStatus(paid, total);

    try {
      setUpdatingAmountPaid(true);

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount_paid: paid,
          payment_status: newPaymentStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el abono");
      }

      /**
       * Tomamos los datos devueltos por el backend.
       * Si el backend devuelve camelCase los usamos.
       */
      const updatedAmountPaid = Number(data.order?.amountPaid ?? paid) || 0;

      const updatedPaymentStatus = (data.order?.paymentStatus ??
        newPaymentStatus) as PaymentStatus;

      /**
       * Actualizar UI inmediatamente
       */
      setOrder((currentOrder) => {
        if (!currentOrder) return currentOrder;

        return {
          ...currentOrder,
          amountPaid: updatedAmountPaid,
          paymentStatus: updatedPaymentStatus,
        };
      });

      setAmountPaid("");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el abono",
      );
    } finally {
      setUpdatingAmountPaid(false);
    }
  }

  /**
   * Obtener pedido
   */
  useEffect(() => {
    async function getOrder() {
      try {
        const response = await fetch(`/api/orders/${params.id}`);

        if (!response.ok) {
          throw new Error("No se pudo obtener el pedido");
        }

        const data = await response.json();

        setOrder(data.order);

        setAmountPaid(String(Number(data.order.amountPaid) || 0));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    getOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0914] p-8 text-white">
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#0B0914] p-8 text-white">
        Pedido no encontrado.
      </div>
    );
  }

  const formatDeliveryDate = (date: string) => {
    const [year, month, day] = date.split("T")[0].split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const total = Number(order.total) || 0;
  const paid = Number(order.amountPaid) || 0;
  const pending = Math.max(total - paid, 0);
  const calculatedPaymentStatus = getPaymentStatus(paid, total);

  return (
    <div className="min-h-screen bg-[#0B0914] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">Administración / Pedidos</p>

          <h1 className="mt-2 text-3xl font-semibold">Pedido #{order.id}</h1>
        </div>

        {/* INFORMACIÓN GENERAL */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* EMPRESA */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
            <p className="text-xs text-gray-500">Empresa</p>

            <p className="mt-2 text-lg font-medium">{order.companyName}</p>
          </div>

          {/* FECHA */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
            <p className="text-xs text-gray-500">Fecha de entrega</p>

            <p className="mt-2 text-lg font-medium">
              {formatDeliveryDate(order.deliveryDate)}
            </p>
          </div>

          {/* ESTADO DEL PEDIDO */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
            <p className="text-xs text-gray-500">Estado</p>

            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="mt-2 w-full rounded-lg border border-purple-500/20 bg-[#0B0914] px-3 py-2 text-sm text-white outline-none transition focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {updatingStatus && (
              <p className="mt-2 text-xs text-gray-500">
                Actualizando estado...
              </p>
            )}
          </div>

          {/* ESTADO DE PAGO */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
            <p className="text-xs text-gray-500">Estado de pago</p>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                  calculatedPaymentStatus === "pagado"
                    ? "bg-green-500/10 text-green-400"
                    : calculatedPaymentStatus === "pago_parcial"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {calculatedPaymentStatus === "pagado"
                  ? "Pagado"
                  : calculatedPaymentStatus === "pago_parcial"
                    ? "Pago parcial"
                    : "Pendiente"}
              </span>
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
          <h2 className="mb-5 text-xl font-semibold">Servicios</h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="rounded-xl bg-[#0B0914] p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.serviceName}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      Cantidad: {item.quantity}
                    </p>

                    {item.width && item.height && (
                      <p className="text-sm text-gray-500">
                        Medidas: {item.width} × {item.height}
                      </p>
                    )}
                  </div>

                  <p className="font-semibold text-purple-400">
                    ${Number(item.subtotal).toLocaleString("es-CO")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTALES Y PAGOS */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* TOTALES */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
            <h2 className="mb-5 text-xl font-semibold">Resumen del pedido</h2>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>

              <span>${Number(order.subtotal).toLocaleString("es-CO")}</span>
            </div>

            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500">
                Descuento ({order.discountPercentage}%)
              </span>

              <span>
                -$
                {Number(order.discountAmount).toLocaleString("es-CO")}
              </span>
            </div>

            {/* ABONO */}
            <div className="mt-4 border-t border-purple-500/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total abonado</span>

                <span className="text-lg font-semibold text-green-400">
                  ${paid.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* SALDO */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Saldo pendiente</span>

                <span className="text-lg font-semibold text-yellow-400">
                  ${pending.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-4 border-t border-purple-500/10 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>

                <span className="text-xl font-bold text-purple-400">
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>

          {/* PAGOS */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#161325] p-6">
            <h2 className="mb-5 text-xl font-semibold">Información de pago</h2>

            {/* TOTAL */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total del pedido</span>

              <span>${total.toLocaleString("es-CO")}</span>
            </div>

            {/* ABONO */}
            <div className="mt-4">
              <label className="mb-2 block text-sm text-gray-500">
                Registrar abono
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={total}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  disabled={updatingAmountPaid}
                  className="w-full rounded-lg border border-purple-500/20 bg-[#0B0914] px-3 py-2 text-sm text-white outline-none focus:border-purple-500 disabled:opacity-50"
                  placeholder="0"
                />

                <button
                  type="button"
                  onClick={handleAmountPaidChange}
                  disabled={updatingAmountPaid}
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingAmountPaid ? "Guardando..." : "Guardar"}
                </button>
              </div>

              <p className="mt-2 text-[10px] text-gray-600">
                El estado del pago se calcula automáticamente.
              </p>
            </div>

            {/* ABONADO */}
            <div className="mt-5 border-t border-purple-500/10 pt-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total abonado</span>

                <span className="text-lg font-semibold text-green-400">
                  ${paid.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* SALDO */}
            <div className="mt-4">
              <div className="flex justify-between">
                <span className="font-semibold">Saldo pendiente</span>

                <span className="text-xl font-bold text-yellow-400">
                  ${pending.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* ESTADO */}
            <div className="mt-5 border-t border-purple-500/10 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Estado de pago</span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    calculatedPaymentStatus === "pagado"
                      ? "bg-green-500/10 text-green-400"
                      : calculatedPaymentStatus === "pago_parcial"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {calculatedPaymentStatus === "pagado"
                    ? "Pagado"
                    : calculatedPaymentStatus === "pago_parcial"
                      ? "Pago parcial"
                      : "Pendiente"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
