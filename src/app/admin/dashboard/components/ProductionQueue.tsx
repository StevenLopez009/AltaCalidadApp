"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type OrderStatus = "pendiente" | "en_produccion";

interface ProductionOrder {
  id: number;
  company_id: number | null;
  delivery_date: string;
  status: OrderStatus;
  total: number;
  company_name: string | null;
  services: string | null;
}

function formatFullDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
  });
}

interface ProductionQueueProps {
  /** Día elegido en el calendario (AAAA-MM-DD). Sin él se muestra toda la cola. */
  selectedDate?: string | null;
}

export default function ProductionQueue({
  selectedDate,
}: ProductionQueueProps) {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProductionOrders() {
      try {
        setLoading(true);

        const response = await fetch(
          selectedDate
            ? `/api/orders?date=${selectedDate}`
            : "/api/orders?productionQueue=true",
        );

        if (!response.ok) {
          throw new Error("No se pudo obtener la cola de producción");
        }

        const data = await response.json();

        setOrders(data.orders ?? []);
      } catch (error) {
        console.error("Error obteniendo cola de producción:", error);

        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    getProductionOrders();
  }, [selectedDate]);

  const getDeliveryDate = (date: string) => {
    const [year, month, day] = date.split("T")[0].split("-").map(Number);

    return new Date(year, month - 1, day);
  };

  const getDaysUntilDelivery = (date: string) => {
    const today = new Date();

    const todayDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    const deliveryDate = getDeliveryDate(date);

    const difference = deliveryDate.getTime() - todayDate.getTime();

    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  };

  const formatDate = (date: string) => {
    return getDeliveryDate(date).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    });
  };

  const statusLabels: Record<OrderStatus, string> = {
    pendiente: "Pendiente",
    en_produccion: "En producción",
  };

  const getPriorityStyle = (date: string) => {
    const days = getDaysUntilDelivery(date);

    if (days <= 0) {
      return "border-red-500/30 bg-red-500/10 text-red-400";
    }

    if (days === 1) {
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
    }

    if (days <= 3) {
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }

    return "border-orange-500/20 bg-orange-500/10 text-orange-300";
  };

  return (
    <div className="flex h-[360px] flex-col">
      {/* HEADER */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Cola de producción
          </h2>

          <p className="text-xs text-zinc-500">
            {selectedDate
              ? `Pendientes del ${formatFullDate(selectedDate)}`
              : "Pedidos próximos a entregar"}
          </p>
        </div>

        <span className="rounded-full border border-orange-500/30 bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-300 shadow-[0_0_15px_rgba(251,146,60,0.15)]">
          {orders.length}
        </span>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-xs text-zinc-500">Cargando pedidos...</p>
        </div>
      )}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <p className="text-xs text-zinc-500">
            {selectedDate
              ? "No hay pedidos pendientes este día."
              : "No hay pedidos en producción."}
          </p>
        </div>
      )}

      {/* LISTA */}
      {!loading && orders.length > 0 && (
        <div
          className="
            min-h-0
            flex-1
            space-y-2
            overflow-y-auto
            pr-2

            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-zinc-700
            hover:scrollbar-thumb-zinc-500
          "
        >
          {orders.map((order) => {
            const daysUntil = getDaysUntilDelivery(order.delivery_date);

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="
                  block
                  rounded-xl
                  border border-white/[0.08]
                  bg-white/[0.03]
                  p-3
                  transition
                  hover:border-orange-500/40
                  hover:bg-orange-500/10
                "
              >
                <div className="flex items-center justify-between gap-3">
                  {/* INFORMACIÓN */}
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {order.services ?? "Sin servicios"}
                    </p>

                    <p className="truncate text-[11px] text-zinc-500">
                      {order.company_name ?? "Sin cliente"}
                    </p>
                  </div>

                  {/* FECHA */}
                  <div
                    className={`
                      shrink-0
                      rounded-lg
                      border
                      px-2.5
                      py-1
                      text-right
                      ${getPriorityStyle(order.delivery_date)}
                    `}
                  >
                    <p className="text-xs font-semibold">
                      {formatDate(order.delivery_date)}
                    </p>

                    <p className="text-[10px]">
                      {daysUntil < 0
                        ? `Vencido ${Math.abs(daysUntil)}d`
                        : daysUntil === 0
                          ? "Entrega hoy"
                          : daysUntil === 1
                            ? "Mañana"
                            : `${daysUntil} días`}
                    </p>
                  </div>
                </div>

                {/* ESTADO */}
                <div className="mt-2">
                  <span className="text-[10px] text-zinc-500">
                    {statusLabels[order.status]}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
