"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface OrderItem {
  id: number;
  categoryId: number;
  serviceId: number;
  serviceName: string;
  categoryName: string | null;
  serviceImage: string | null;
  quantity: number;
  width: number | null;
  height: number | null;
  unit: string;
  unitPrice: number;
  subtotal: number;
  designFile: string | null;
  observations: string | null;
  addons: {
    id: number;
    name: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }[];
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
  customerType: "empresa" | "usuario" | null;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  payments: {
    id: number;
    amount: number;
    paymentMethod: string;
    digitalProvider: string | null;
    receiptFile: string | null;
    paidAt: string;
  }[];
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const params = useParams();

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingAmountPaid, setUpdatingAmountPaid] = useState(false);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "digital">(
    "efectivo",
  );
  const [digitalProvider, setDigitalProvider] = useState<
    "nequi" | "daviplata" | "banco"
  >("nequi");
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

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

  async function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setUploadingReceipt(true);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "No se pudo subir el comprobante");
        return;
      }

      setReceiptFile(data.url);
    } catch (error) {
      console.error("Error subiendo el comprobante:", error);

      alert("Error subiendo el comprobante");
    } finally {
      setUploadingReceipt(false);
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
          payment_method: paymentMethod,
          digital_provider:
            paymentMethod === "digital" ? digitalProvider : null,
          receipt_file: receiptFile,
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
      <div className="min-h-screen bg-[#121215] p-8 text-white">
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#121215] p-8 text-white">
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
    <div className="min-h-screen bg-[#121215] p-8 text-white">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs text-zinc-500">Administración / Pedidos</p>

          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Pedido #{order.id}
          </h1>
        </div>

        {/* INFORMACIÓN GENERAL */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* CLIENTE */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <p className="text-xs text-zinc-500">
              {order.customerType === "usuario" ? "Cliente" : "Empresa"}
            </p>

            <p className="mt-2 text-base font-semibold">
              {order.customerType === "usuario"
                ? order.customerName || "—"
                : order.companyName || "—"}
            </p>

            {order.customerType === "usuario" && order.customerPhone && (
              <p className="mt-1 text-xs text-zinc-500">
                {order.customerPhone}
              </p>
            )}
          </div>

          {/* FECHA DEL PEDIDO */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <p className="text-xs text-zinc-500">Fecha del pedido</p>

            <p className="mt-2 text-base font-semibold">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("es-CO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </p>
          </div>

          {/* FECHA */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <p className="text-xs text-zinc-500">Fecha de entrega</p>

            <p className="mt-2 text-base font-semibold">
              {formatDeliveryDate(order.deliveryDate)}
            </p>
          </div>

          {/* ESTADO DEL PEDIDO */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <p className="text-xs text-zinc-500">Estado</p>

            <select
              value={order.status}
              onChange={handleStatusChange}
              disabled={updatingStatus}
              className="mt-2 w-full rounded-xl border border-white/[0.08] bg-[#121215] px-3 py-2 text-xs text-white outline-none transition focus:border-orange-500/40 focus:bg-orange-500/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {updatingStatus && (
              <p className="mt-2 text-[11px] text-zinc-500">
                Actualizando estado...
              </p>
            )}
          </div>

          {/* ESTADO DE PAGO */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <p className="text-xs text-zinc-500">Estado de pago</p>

            <div className="mt-2">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  calculatedPaymentStatus === "pagado"
                    ? "border border-green-500/30 bg-green-500/10 text-green-400"
                    : calculatedPaymentStatus === "pago_parcial"
                      ? "border border-orange-500/30 bg-orange-500/10 text-orange-400"
                      : "border border-red-500/30 bg-red-500/10 text-red-400"
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
        <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          <h2 className="mb-5 text-lg font-semibold text-white">Servicios</h2>

          {order.observations && (
            <p className="mb-4 rounded-xl border border-white/[0.06] bg-[#121215] p-3 text-xs text-zinc-400">
              Observaciones del cliente: {order.observations}
            </p>
          )}

          {order.designFile && (
            <div className="mb-4">
              <p className="text-[11px] text-zinc-500">
                Archivo de diseño del pedido:
              </p>

              <a
                href={order.designFile}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block max-w-[260px] overflow-hidden rounded-lg border border-white/[0.08]"
              >
                <img
                  src={order.designFile}
                  alt="Archivo de diseño del pedido"
                  className="h-28 w-full object-cover"
                />
              </a>
            </div>
          )}

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 rounded-xl border border-white/[0.06] bg-[#121215] p-4"
              >
                <div className="flex flex-1 justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.serviceName}
                    </p>

                    {item.categoryName && (
                      <p className="mt-0.5 text-[11px] text-orange-300/80">
                        {item.categoryName}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-zinc-500">
                      Cantidad: {item.quantity}
                    </p>

                    <p className="text-xs text-zinc-500">
                      Precio unitario: $
                      {Number(item.unitPrice).toLocaleString("es-CO")} /{" "}
                      {item.unit}
                    </p>

                    {(item.width || item.height) && (
                      <p className="text-xs text-zinc-500">
                        Medidas: {item.width ?? "—"} × {item.height ?? "—"}{" "}
                        {item.unit === "m2" ? "m" : ""}
                      </p>
                    )}

                    {item.observations && (
                      <p className="mt-1 text-xs text-zinc-400">
                        Observaciones: {item.observations}
                      </p>
                    )}

                    {(item.addons ?? []).length > 0 && (
                      <ul className="mt-2 space-y-1 border-l border-orange-500/20 pl-2.5">
                        {item.addons.map((addon) => (
                          <li
                            key={addon.id}
                            className="flex flex-wrap items-baseline gap-x-2 text-[11px] text-zinc-500"
                          >
                            <span className="text-zinc-400">
                              + {addon.name}
                            </span>

                            <span>
                              ×{Number(addon.quantity)} ·{" "}
                              {`$${Number(addon.subtotal).toLocaleString("es-CO")}`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-orange-300">
                    ${Number(item.subtotal).toLocaleString("es-CO")}
                  </p>
                </div>

                {/* IMÁGENES A LA DERECHA: servicio + archivo a imprimir */}
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03]">
                    {item.serviceImage ? (
                      <img
                        src={item.serviceImage}
                        alt={item.serviceName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-600">
                        Sin imagen
                      </div>
                    )}
                  </div>

                  {item.designFile && (
                    <a
                      href={item.designFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Imagen a imprimir"
                      className="block h-20 w-20 overflow-hidden rounded-lg border border-orange-500/30"
                    >
                      <img
                        src={item.designFile}
                        alt={`Imagen a imprimir de ${item.serviceName}`}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOTALES Y PAGOS */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* TOTALES */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Resumen del pedido
            </h2>

            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Subtotal</span>

              <span>${Number(order.subtotal).toLocaleString("es-CO")}</span>
            </div>

            <div className="mt-3 flex justify-between text-xs">
              <span className="text-zinc-500">
                Descuento ({order.discountPercentage}%)
              </span>

              <span>
                -$
                {Number(order.discountAmount).toLocaleString("es-CO")}
              </span>
            </div>

            {/* ABONO */}
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Total abonado</span>

                <span className="text-sm font-semibold text-green-400">
                  ${paid.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* SALDO */}
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Saldo pendiente</span>

                <span className="text-sm font-semibold text-orange-400">
                  ${pending.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-4 border-t border-white/[0.06] pt-4">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-white">Total</span>

                <span className="text-base font-bold text-orange-300">
                  ${total.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* COMPROBANTES DE PAGO */}
            {(order.payments ?? []).some((p) => p.receiptFile) && (
              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <p className="mb-2 text-xs text-zinc-500">
                  Comprobante de pago
                </p>

                <ul className="space-y-1">
                  {order.payments
                    .filter((p) => p.receiptFile)
                    .map((p) => (
                      <li key={p.id}>
                        <a
                          href={p.receiptFile!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-300 underline underline-offset-2 hover:text-orange-200"
                        >
                          Ver comprobante #{p.id} — $
                          {Number(p.amount).toLocaleString("es-CO")} (
                          {p.paymentMethod}
                          {p.digitalProvider ? ` · ${p.digitalProvider}` : ""})
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* PAGOS */}
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Información de pago
            </h2>

            {/* TOTAL */}
            <div className="flex justify-between text-xs">
              <span className="text-zinc-500">Total del pedido</span>

              <span>${total.toLocaleString("es-CO")}</span>
            </div>

            {/* ABONO */}
            <div className="mt-4">
              <label className="mb-2 block text-xs text-zinc-500">
                Registrar abono
              </label>

              <div className="mb-2 grid grid-cols-2 gap-2">
                {(
                  [
                    { value: "efectivo", label: "Efectivo", color: "#d95926" },
                    { value: "digital", label: "Digital", color: "#3987e5" },
                  ] as const
                ).map((method) => {
                  const isActive = paymentMethod === method.value;

                  return (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      disabled={updatingAmountPaid}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                        isActive
                          ? "border-white/25 bg-white/10 text-white"
                          : "border-white/[0.08] bg-[#121215] text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: method.color }}
                      />

                      {method.label}
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "digital" && (
                <div className="mb-2 grid grid-cols-3 gap-2">
                  {(
                    [
                      { value: "nequi", label: "Nequi" },
                      { value: "daviplata", label: "Daviplata" },
                      { value: "banco", label: "Banco" },
                    ] as const
                  ).map((provider) => {
                    const isActive = digitalProvider === provider.value;

                    return (
                      <button
                        key={provider.value}
                        type="button"
                        onClick={() => setDigitalProvider(provider.value)}
                        disabled={updatingAmountPaid}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                          isActive
                            ? "border-white/25 bg-white/10 text-white"
                            : "border-white/[0.08] bg-[#121215] text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {provider.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* El comprobante solo aplica cuando el abono salda el total. */}
              {Number(amountPaid) > 0 && Number(amountPaid) >= pending && (
                <div className="mb-2">
                  {receiptFile ? (
                    <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#121215] p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={receiptFile}
                        alt="Comprobante de pago"
                        className="h-12 w-12 rounded-lg object-cover"
                      />

                      <span className="flex-1 truncate text-[11px] text-zinc-400">
                        Comprobante adjuntado
                      </span>

                      <button
                        type="button"
                        onClick={() => setReceiptFile(null)}
                        disabled={updatingAmountPaid}
                        className="rounded-lg p-1.5 text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
                        aria-label="Quitar comprobante"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-[#121215] px-3 py-3 text-[11px] font-semibold text-zinc-500 transition hover:text-zinc-300">
                      {uploadingReceipt
                        ? "Subiendo..."
                        : "Adjuntar comprobante de pago"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptChange}
                        disabled={uploadingReceipt || updatingAmountPaid}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max={total}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  disabled={updatingAmountPaid}
                  className="w-full rounded-xl border border-white/[0.08] bg-[#121215] px-3 py-2 text-xs text-white outline-none focus:border-orange-500/40 focus:bg-orange-500/5 disabled:opacity-50"
                  placeholder="0"
                />

                <button
                  type="button"
                  onClick={handleAmountPaidChange}
                  disabled={updatingAmountPaid}
                  className="rounded-xl border border-orange-500/30 bg-orange-500/15 px-4 py-2 text-xs font-semibold text-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.15)] transition hover:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updatingAmountPaid ? "Guardando..." : "Guardar"}
                </button>
              </div>

              <p className="mt-2 text-[10px] text-zinc-600">
                El estado del pago se calcula automáticamente.
              </p>
            </div>

            {/* ABONADO */}
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <div className="flex justify-between">
                <span className="text-xs text-zinc-500">Total abonado</span>

                <span className="text-sm font-semibold text-green-400">
                  ${paid.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* SALDO */}
            <div className="mt-4">
              <div className="flex justify-between">
                <span className="text-xs font-semibold text-white">
                  Saldo pendiente
                </span>

                <span className="text-base font-bold text-orange-400">
                  ${pending.toLocaleString("es-CO")}
                </span>
              </div>
            </div>

            {/* ESTADO */}
            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Estado de pago</span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    calculatedPaymentStatus === "pagado"
                      ? "border border-green-500/30 bg-green-500/10 text-green-400"
                      : calculatedPaymentStatus === "pago_parcial"
                        ? "border border-orange-500/30 bg-orange-500/10 text-orange-400"
                        : "border border-red-500/30 bg-red-500/10 text-red-400"
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
