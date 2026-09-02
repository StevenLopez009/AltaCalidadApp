"use client";

import { useEffect, useState } from "react";

interface Order {
  id: number;
  delivery_date: string;
  status:
    | "pendiente"
    | "en_produccion"
    | "terminado"
    | "entregado"
    | "cancelado";
}

const daysOfWeek = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function Calendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /*
   * ============================================================
   * OBTENER PEDIDOS DEL MES
   * ============================================================
   */

  useEffect(() => {
    async function getOrdersByMonth() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/orders?year=${year}&month=${month + 1}`,
        );

        if (!response.ok) {
          throw new Error("No se pudieron obtener los pedidos");
        }

        const data = await response.json();

        // Solo mostrar pedidos pendientes
        const pendingOrders = (data.orders ?? []).filter(
          (order: Order) => order.status === "pendiente",
        );

        setOrders(pendingOrders);
      } catch (error) {
        console.error("Error obteniendo pedidos del calendario:", error);

        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    getOrdersByMonth();
  }, [year, month]);

  /*
   * ============================================================
   * CALENDARIO
   * ============================================================
   */

  const firstDay = new Date(year, month, 1).getDay();

  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  /*
   * ============================================================
   * NAVEGACIÓN
   * ============================================================
   */

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));

    setSelectedDate(1);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));

    setSelectedDate(1);
  };

  const goToToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));

    setSelectedDate(today.getDate());
  };

  /*
   * ============================================================
   * GENERAR DÍAS
   * ============================================================
   */

  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  /*
   * ============================================================
   * PEDIDOS DE UN DÍA
   * ============================================================
   */

  const getOrdersForDay = (day: number) => {
    return orders.filter((order) => {
      const date = order.delivery_date.split("T")[0];
      const [orderYear, orderMonth, orderDay] = date.split("-").map(Number);
      return orderYear === year && orderMonth === month + 1 && orderDay === day;
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Calendario</h2>

          <p className="text-xs text-zinc-500">
            {months[month]} {year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-zinc-400 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-300"
          >
            →
          </button>
        </div>
      </div>

      {/* Días de la semana */}

      <div className="grid grid-cols-7 mb-2">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-medium text-zinc-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Días */}

      <div className="grid flex-1 grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const dayOrders = getOrdersForDay(day);

          const hasOrders = dayOrders.length > 0;

          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          const isSelected = day === selectedDate;

          return (
            <button
              type="button"
              key={day}
              onClick={() => setSelectedDate(day)}
              className={`
                relative
                flex
                flex-col
                items-center
                justify-center
                rounded-xl
                text-xs
                font-medium
                transition

                ${
                  isSelected
                    ? "border border-orange-500/40 bg-orange-500/20 text-white shadow-[0_0_15px_rgba(251,146,60,0.2)]"
                    : hasOrders
                      ? "border border-orange-500/20 bg-orange-500/10 text-orange-200 hover:border-orange-500/40 hover:bg-orange-500/15"
                      : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200"
                }
              `}
            >
              {/* Número del día */}

              <span>{day}</span>

              {/* Pedido */}

              {hasOrders && (
                <span
                  className={`
                    absolute
                    bottom-1.5
                    h-1.5
                    w-1.5
                    rounded-full

                    ${isSelected ? "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,1)]" : "bg-orange-400/80"}
                  `}
                />
              )}

              {/* Cantidad */}

              {dayOrders.length > 1 && (
                <span
                  className="
                    absolute
                    right-1.5
                    top-1
                    text-[9px]
                    font-semibold
                    text-orange-300
                  "
                >
                  {dayOrders.length}
                </span>
              )}

              {/* Hoy */}

              {isToday && !hasOrders && !isSelected && (
                <span
                  className="
                      absolute
                      bottom-1.5
                      h-1
                      w-1
                      rounded-full
                      bg-zinc-400
                    "
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}

      {loading && (
        <p className="mt-2 text-center text-xs text-zinc-500">
          Cargando pedidos...
        </p>
      )}

      {/* Información del día seleccionado */}

      {!loading && (
        <div className="mt-3 border-t border-white/[0.06] pt-3">
          <p className="text-[11px] text-zinc-500">
            {selectedDate} de {months[month]}
          </p>

          <p className="text-xs font-semibold text-white">
            {getOrdersForDay(selectedDate).length === 0
              ? "Sin pedidos"
              : `${getOrdersForDay(selectedDate).length} pedido${
                  getOrdersForDay(selectedDate).length > 1 ? "s" : ""
                }`}
          </p>
        </div>
      )}
    </div>
  );
}
