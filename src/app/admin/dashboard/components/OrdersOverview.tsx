"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "pendiente"
  | "en_produccion"
  | "terminado"
  | "entregado"
  | "cancelado";

type PaymentStatus = "pendiente" | "pagado" | "pago_parcial";

interface Order {
  id: number;
  company_id: number | null;
  customer_type: "empresa" | "usuario";
  company_name: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_date: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: number;
  services: string;
  amount_paid: number;
}

export default function OrdersOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [statusFilter, setStatusFilter] = useState<OrderStatus | "todos">(
    "todos",
  );

  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "todos">(
    "todos",
  );

  useEffect(() => {
    async function getOrders() {
      try {
        setLoading(true);

        const response = await fetch("/api/orders");

        if (!response.ok) {
          throw new Error("No se pudieron obtener los pedidos");
        }

        const data = await response.json();

        setOrders(data.orders ?? []);
      } catch (error) {
        console.error("Error obteniendo pedidos:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    getOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      // Buscar empresa, cliente o teléfono
      const matchesCustomer =
        !search ||
        order.company_name?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_phone?.toLowerCase().includes(search);

      // Fechas
      const orderDate = order.delivery_date.split("T")[0];

      const matchesStartDate = !startDate || orderDate >= startDate;

      const matchesEndDate = !endDate || orderDate <= endDate;

      // Estado del pedido
      const matchesStatus =
        statusFilter === "todos" || order.status === statusFilter;

      // Estado del pago
      const matchesPayment =
        paymentFilter === "todos" || order.payment_status === paymentFilter;

      return (
        matchesCustomer &&
        matchesStartDate &&
        matchesEndDate &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [orders, searchTerm, startDate, endDate, statusFilter, paymentFilter]);

  const totalOrders = useMemo(() => {
    return filteredOrders
      .filter((order) => order.status !== "cancelado")
      .reduce((total, order) => total + Number(order.total ?? 0), 0);
  }, [filteredOrders]);

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("T")[0].split("-").map(Number);

    return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pendiente: "Pendiente",
      en_produccion: "En producción",
      terminado: "Terminado",
      entregado: "Entregado",
      cancelado: "Cancelado",
    };

    return labels[status];
  };

  const getStatusStyle = (status: OrderStatus) => {
    const styles: Record<OrderStatus, string> = {
      pendiente: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",

      en_produccion: "border-blue-500/20 bg-blue-500/10 text-blue-400",

      terminado: "border-purple-500/20 bg-purple-500/10 text-purple-400",

      entregado: "border-green-500/20 bg-green-500/10 text-green-400",

      cancelado: "border-red-500/20 bg-red-500/10 text-red-400",
    };

    return styles[status];
  };

  const getPaymentLabel = (status: PaymentStatus) => {
    const labels: Record<PaymentStatus, string> = {
      pendiente: "Pendiente",
      pago_parcial: "Pago parcial",
      pagado: "Pagado",
    };

    return labels[status];
  };

  const getPaymentStyle = (status: PaymentStatus) => {
    const styles: Record<PaymentStatus, string> = {
      pendiente: "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",

      pago_parcial: "border-orange-500/20 bg-orange-500/10 text-orange-400",

      pagado: "border-green-500/20 bg-green-500/10 text-green-400",
    };

    return styles[status];
  };

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Pedidos</h2>

          <p className="text-xs text-gray-500">
            Información general de pedidos
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="rounded-lg bg-purple-500/10 px-3 py-2 text-xs text-purple-400 transition hover:bg-purple-500/20"
        >
          Ver todos
        </Link>
      </div>

      {/* FILTROS + TOTAL */}
      <div className="mb-4 flex items-end gap-3">
        {/* BUSCADOR */}
        <div className="min-w-0 flex-1">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Cliente o empresa
          </label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente o empresa..."
            className="w-full rounded-xl border border-purple-500/20 bg-[#0B0914] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 transition focus:border-purple-500/50"
          />
        </div>

        {/* FECHAS */}
        <div className="w-[150px] shrink-0">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Fecha de entrega
          </label>

          <div className="flex flex-col gap-1.5">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-purple-500/20 bg-[#0B0914] px-3 py-2 text-xs text-white outline-none transition focus:border-purple-500/50 [color-scheme:dark]"
              title="Fecha desde"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-purple-500/20 bg-[#0B0914] px-3 py-2 text-xs text-white outline-none transition focus:border-purple-500/50 [color-scheme:dark]"
              title="Fecha hasta"
            />
          </div>
        </div>

        {/* ESTADOS */}
        <div className="w-[165px] shrink-0">
          <label className="mb-1.5 block text-xs font-medium text-gray-500">
            Estados
          </label>

          <div className="flex flex-col gap-1.5">
            {/* ESTADO DEL PEDIDO */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "todos")
              }
              className="w-full rounded-lg border border-purple-500/20 bg-[#0B0914] px-3 py-2 text-xs text-white outline-none transition focus:border-purple-500/50 [color-scheme:dark]"
              title="Estado del pedido"
            >
              <option value="todos">Todos los pedidos</option>

              <option value="pendiente">Pendiente</option>

              <option value="en_produccion">En producción</option>

              <option value="terminado">Terminado</option>

              <option value="entregado">Entregado</option>

              <option value="cancelado">Cancelado</option>
            </select>

            {/* ESTADO DEL PAGO */}
            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as PaymentStatus | "todos")
              }
              className="w-full rounded-lg border border-purple-500/20 bg-[#0B0914] px-3 py-2 text-xs text-white outline-none transition focus:border-purple-500/50 [color-scheme:dark]"
              title="Estado de pago"
            >
              <option value="todos">Todos los pagos</option>

              <option value="pendiente">Pago pendiente</option>

              <option value="pago_parcial">Pago parcial</option>

              <option value="pagado">Pagado</option>
            </select>
          </div>
        </div>

        {/* TOTAL FILTRADO */}
        <div className="w-[210px] shrink-0 rounded-xl border border-purple-500/20 bg-[#161325] px-5 py-3">
          <p className="text-xs text-gray-500">Total filtrado</p>

          <p className="mt-1 text-lg font-bold text-purple-400">
            ${totalOrders.toLocaleString("es-CO")}
          </p>

          <p className="text-[10px] text-gray-600">Sin pedidos cancelados</p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Cargando pedidos...</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredOrders.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">
            {searchTerm ||
            startDate ||
            endDate ||
            statusFilter !== "todos" ||
            paymentFilter !== "todos"
              ? "No se encontraron pedidos con los filtros seleccionados."
              : "No hay pedidos registrados."}
          </p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredOrders.length > 0 && (
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-purple-500/10">
          <div className="h-full overflow-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="sticky top-0 z-10 bg-[#0B0914]">
                <tr className="border-b border-purple-500/10">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500">
                    Pedido
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-gray-500">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-gray-500">
                    Servicios
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-gray-500">
                    Entrega
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-gray-500">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-gray-500">
                    Pago
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    Abonado
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    Debe
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const total = Number(order.total ?? 0);
                  const amountPaid = Number(order.amount_paid ?? 0);

                  const remaining = Math.max(total - amountPaid, 0);

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-purple-500/10 transition hover:bg-purple-500/5"
                    >
                      {/* PEDIDO */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-sm font-semibold text-white transition hover:text-purple-400"
                        >
                          #{order.id}
                        </Link>
                      </td>

                      {/* CLIENTE */}
                      <td className="max-w-[220px] px-4 py-3">
                        <div>
                          <p
                            className="truncate text-sm text-gray-300"
                            title={
                              order.customer_type === "empresa"
                                ? (order.company_name ?? "")
                                : (order.customer_name ?? "")
                            }
                          >
                            {order.customer_type === "empresa"
                              ? order.company_name || "Sin empresa"
                              : order.customer_name || "Sin cliente"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-gray-600">
                            {order.customer_type === "empresa"
                              ? "Empresa"
                              : order.customer_phone || "Usuario"}
                          </p>
                        </div>
                      </td>

                      {/* SERVICIOS */}
                      <td className="max-w-[260px] px-4 py-3">
                        <p
                          className="truncate text-sm text-gray-300"
                          title={order.services}
                        >
                          {order.services || "Sin servicios"}
                        </p>
                      </td>

                      {/* ENTREGA */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-gray-300">
                          {formatDate(order.delivery_date)}
                        </p>
                      </td>

                      {/* ESTADO */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${getStatusStyle(
                            order.status,
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      {/* PAGO */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-medium ${getPaymentStyle(
                            order.payment_status,
                          )}`}
                        >
                          {getPaymentLabel(order.payment_status)}
                        </span>
                      </td>

                      {/* ABONADO */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-green-400">
                          ${amountPaid.toLocaleString("es-CO")}
                        </p>
                      </td>

                      {/* DEBE */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <p
                          className={`text-sm font-semibold ${
                            remaining > 0 ? "text-red-400" : "text-green-400"
                          }`}
                        >
                          ${remaining.toLocaleString("es-CO")}
                        </p>
                      </td>

                      {/* TOTAL */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-purple-400">
                          ${total.toLocaleString("es-CO")}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
