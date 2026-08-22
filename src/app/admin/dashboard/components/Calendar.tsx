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
          <h2 className="text-xl font-semibold text-white">Calendario</h2>

          <p className="text-sm text-gray-500">
            {months[month]} {year}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B0914] text-gray-400 transition hover:bg-purple-600 hover:text-white"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="rounded-lg bg-[#0B0914] px-3 py-2 text-xs text-gray-400 transition hover:bg-purple-600 hover:text-white"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B0914] text-gray-400 transition hover:bg-purple-600 hover:text-white"
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
            className="text-center text-xs font-medium text-gray-500"
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
                rounded-lg
                text-sm
                transition

                ${
                  isSelected
                    ? "bg-pink-600 text-white"
                    : hasOrders
                      ? "bg-purple-600 text-white hover:bg-purple-500/20"
                      : "text-gray-300 hover:bg-purple-500/20"
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
                    bottom-1
                    h-1.5
                    w-1.5
                    rounded-full

                    ${isSelected ? "bg-white" : "bg-purple-400"}
                  `}
                />
              )}

              {/* Cantidad */}

              {dayOrders.length > 1 && (
                <span
                  className="
                    absolute
                    right-1
                    top-1
                    text-[9px]
                    font-semibold
                    text-purple-300
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
                      bottom-1
                      h-1
                      w-1
                      rounded-full
                      bg-purple-400
                    "
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Loading */}

      {loading && (
        <p className="mt-2 text-center text-xs text-gray-500">
          Cargando pedidos...
        </p>
      )}

      {/* Información del día seleccionado */}

      {!loading && (
        <div className="mt-3 border-t border-purple-500/10 pt-3">
          <p className="text-xs text-gray-500">
            {selectedDate} de {months[month]}
          </p>

          <p className="text-sm text-white">
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
