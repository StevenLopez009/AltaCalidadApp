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

  const [searchTerm, setSearchTerm] = useState("");
  const [orderId, setOrderId] = useState("");
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

    // Se ignora todo lo que no sea numero para que "#128" tambien encuentre.
    const id = orderId.replace(/\D/g, "");

    return orders.filter((order) => {
      // Empieza por, no contiene: escribir "12" no debe traer el pedido 512.
      const matchesId = !id || String(order.id).startsWith(id);

      const matchesCustomer =
        !search ||
        order.company_name?.toLowerCase().includes(search) ||
        order.customer_name?.toLowerCase().includes(search) ||
        order.customer_phone?.toLowerCase().includes(search);

      const orderDate = order.delivery_date.split("T")[0];

      const matchesStartDate = !startDate || orderDate >= startDate;

      const matchesEndDate = !endDate || orderDate <= endDate;

      const matchesStatus =
        statusFilter === "todos" || order.status === statusFilter;

      const matchesPayment =
        paymentFilter === "todos" || order.payment_status === paymentFilter;

      return (
        matchesId &&
        matchesCustomer &&
        matchesStartDate &&
        matchesEndDate &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    orderId,
    searchTerm,
    startDate,
    endDate,
    statusFilter,
    paymentFilter,
  ]);

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
      pendiente: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",

      en_produccion: "border-orange-500/30 bg-orange-500/10 text-orange-400",

      terminado: "border-orange-500/30 bg-orange-500/10 text-orange-300",

      entregado: "border-green-500/30 bg-green-500/10 text-green-400",

      cancelado: "border-red-500/30 bg-red-500/10 text-red-400",
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
      pendiente: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",

      pago_parcial: "border-orange-500/30 bg-orange-500/10 text-orange-400",

      pagado: "border-green-500/30 bg-green-500/10 text-green-400",
    };

    return styles[status];
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Pedidos</h2>

          <p className="text-xs text-zinc-500">
            Información general de pedidos
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="
            w-full
            rounded-lg
            border border-orange-500/20
            bg-orange-500/10
            px-3
            py-2
            text-center
            text-xs
            font-medium
            text-orange-300
            transition
            hover:border-orange-500/40
            hover:bg-orange-500/15
            hover:text-orange-200
            sm:w-auto
          "
        >
          Ver todos
        </Link>
      </div>

      {/* FILTROS */}
      <div
        className="
          mb-4
          grid
          grid-cols-1
          gap-3
          md:grid-cols-2
          xl:grid-cols-[120px_minmax(200px,1fr)_150px_165px_210px]
          xl:items-end
        "
      >
        {/* BUSCADOR POR ID */}
        <div className="min-w-0">
          <label
            htmlFor="order-id-search"
            className="mb-1.5 block text-xs font-medium text-zinc-500"
          >
            N.º de pedido
          </label>

          <input
            id="order-id-search"
            type="text"
            inputMode="numeric"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="#000"
            className="
              w-full
              rounded-xl
              border border-orange-500/20
              bg-[#0B0914]
              px-4
              py-3
              text-sm
              text-white
              outline-none
              placeholder:text-zinc-600
              transition
              focus:border-orange-500/50
              focus:ring-1
              focus:ring-orange-500/20
            "
          />
        </div>

        {/* BUSCADOR */}
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">
            Cliente o empresa
          </label>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente o empresa..."
            className="
              w-full
              rounded-xl
              border border-orange-500/20
              bg-[#0B0914]
              px-4
              py-3
              text-sm
              text-white
              outline-none
              placeholder:text-zinc-600
              transition
              focus:border-orange-500/50
              focus:ring-1
              focus:ring-orange-500/20
            "
          />
        </div>

        {/* FECHAS */}
        <div className="w-full">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">
            Fecha de entrega
          </label>

          <div className="grid grid-cols-2 gap-2 xl:flex xl:flex-col">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-orange-500/20
                bg-[#0B0914]
                px-3
                py-2
                text-xs
                text-white
                outline-none
                transition
                focus:border-orange-500/50
                [color-scheme:dark]
              "
              title="Fecha desde"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="
                w-full
                rounded-lg
                border border-orange-500/20
                bg-[#0B0914]
                px-3
                py-2
                text-xs
                text-white
                outline-none
                transition
                focus:border-orange-500/50
                [color-scheme:dark]
              "
              title="Fecha hasta"
            />
          </div>
        </div>

        {/* ESTADOS */}
        <div className="w-full">
          <label className="mb-1.5 block text-xs font-medium text-zinc-500">
            Estados
          </label>

          <div className="grid grid-cols-2 gap-2 xl:flex xl:flex-col">
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "todos")
              }
              className="
                w-full
                rounded-lg
                border border-orange-500/20
                bg-[#0B0914]
                px-3
                py-2
                text-xs
                text-white
                outline-none
                transition
                focus:border-orange-500/50
                [color-scheme:dark]
              "
              title="Estado del pedido"
            >
              <option value="todos">Todos los pedidos</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_produccion">En producción</option>
              <option value="terminado">Terminado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as PaymentStatus | "todos")
              }
              className="
                w-full
                rounded-lg
                border border-orange-500/20
                bg-[#0B0914]
                px-3
                py-2
                text-xs
                text-white
                outline-none
                transition
                focus:border-orange-500/50
                [color-scheme:dark]
              "
              title="Estado de pago"
            >
              <option value="todos">Todos los pagos</option>
              <option value="pendiente">Pago pendiente</option>
              <option value="pago_parcial">Pago parcial</option>
              <option value="pagado">Pagado</option>
            </select>
          </div>
        </div>

        {/* TOTAL */}
        <div
          className="
            w-full
            rounded-xl
            border border-orange-500/20
            bg-gradient-to-br
            from-orange-500/10
            to-[#100D1C]
            px-5
            py-3
            shadow-[0_0_20px_rgba(251,146,60,0.04)]
          "
        >
          <p className="text-xs text-zinc-500">Total filtrado</p>

          <p className="mt-1 text-lg font-bold text-orange-400">
            ${totalOrders.toLocaleString("es-CO")}
          </p>

          <p className="text-[10px] text-zinc-600">Sin pedidos cancelados</p>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-zinc-500">Cargando pedidos...</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && filteredOrders.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-4 text-center">
          <p className="text-xs text-zinc-500">
            {orderId ||
            searchTerm ||
            startDate ||
            endDate ||
            statusFilter !== "todos" ||
            paymentFilter !== "todos"
              ? "No se encontraron pedidos con los filtros seleccionados."
              : "No hay pedidos registrados."}
          </p>
        </div>
      )}

      {/* TABLA */}
      {!loading && filteredOrders.length > 0 && (
        <div
          className="
            h-[400px]
            overflow-hidden
            rounded-xl
            border border-orange-500/10
            bg-white/[0.02]
          "
        >
          <div className="h-full overflow-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="sticky top-0 z-10 bg-[#0B0914]">
                <tr className="border-b border-orange-500/10">
                  <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                    Pedido
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                    Cliente
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                    Servicios
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                    Entrega
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-xs font-medium text-zinc-500">
                    Pago
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">
                    Abonado
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">
                    Debe
                  </th>

                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">
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
                      className="
                        border-b
                        border-orange-500/10
                        transition
                        hover:bg-orange-500/5
                      "
                    >
                      {/* PEDIDO */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="
                            text-sm
                            font-semibold
                            text-white
                            transition
                            hover:text-orange-400
                          "
                        >
                          #{order.id}
                        </Link>
                      </td>

                      {/* CLIENTE */}
                      <td className="max-w-[220px] px-4 py-3">
                        <div>
                          <p
                            className="
                              truncate
                              text-sm
                              text-zinc-300
                            "
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

                          <p className="mt-0.5 text-[10px] text-zinc-600">
                            {order.customer_type === "empresa"
                              ? "Empresa"
                              : order.customer_phone || "Usuario"}
                          </p>
                        </div>
                      </td>

                      {/* SERVICIOS */}
                      <td className="max-w-[260px] px-4 py-3">
                        <p
                          className="
                            truncate
                            text-sm
                            text-zinc-300
                          "
                          title={order.services}
                        >
                          {order.services || "Sin servicios"}
                        </p>
                      </td>

                      {/* ENTREGA */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <p className="text-sm text-zinc-300">
                          {formatDate(order.delivery_date)}
                        </p>
                      </td>

                      {/* ESTADO */}
                      <td className="px-4 py-3">
                        <span
                          className={`
                            inline-flex
                            whitespace-nowrap
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[10px]
                            font-medium
                            ${getStatusStyle(order.status)}
                          `}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      {/* PAGO */}
                      <td className="px-4 py-3">
                        <span
                          className={`
                            inline-flex
                            whitespace-nowrap
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-[10px]
                            font-medium
                            ${getPaymentStyle(order.payment_status)}
                          `}
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
                          className={`
                            text-sm
                            font-semibold
                            ${remaining > 0 ? "text-red-400" : "text-green-400"}
                          `}
                        >
                          ${remaining.toLocaleString("es-CO")}
                        </p>
                      </td>

                      {/* TOTAL */}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <p className="text-sm font-semibold text-orange-400">
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
