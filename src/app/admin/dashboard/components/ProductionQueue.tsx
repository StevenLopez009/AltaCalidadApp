"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProductionOrder {
  id: number;
  company_id: number;
  delivery_date: string;
  status: "pendiente" | "en_produccion";
  total: number;
  company_name: string;
  services: string;
}

export default function ProductionQueue() {
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProductionOrders() {
      try {
        setLoading(true);

        const response = await fetch("/api/orders?productionQueue=true");

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
  }, []);

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

  const getStatusLabel = (status: ProductionOrder["status"]) => {
    if (status === "pendiente") {
      return "Pendiente";
    }

    return "En producción";
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

    return "border-purple-500/20 bg-purple-500/10 text-purple-400";
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Cola de producción
          </h2>
          <p className="text-xs text-gray-500">Pedidos próximos a entregar</p>
        </div>
        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-400">
          {orders.length}
        </span>
      </div>
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">Cargando pedidos...</p>
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-gray-500">No hay pedidos en producción.</p>
        </div>
      )}
      {!loading && orders.length > 0 && (
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {orders.map((order) => {
            const daysUntil = getDaysUntilDelivery(order.delivery_date);

            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-xl border border-purple-500/10 bg-[#0B0914] p-3 transition hover:border-purple-500/40 hover:bg-purple-500/5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {order.services}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {order.company_name}
                    </p>
                  </div>
                  <div
                    className={`
                      rounded-lg border px-2 py-1 text-right
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
                <div className="mt-2">
                  <span className="text-[10px] text-gray-500">
                    {getStatusLabel(order.status)}
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
