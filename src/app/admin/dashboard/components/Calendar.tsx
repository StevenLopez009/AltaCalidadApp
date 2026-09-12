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

function toISODate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0",
  )}`;
}

interface CalendarProps {
  /**
   * Recibe el día elegido como AAAA-MM-DD. Debe ser una referencia estable
   * (por ejemplo el setter de un useState) para no reiniciar el efecto.
   */
  onSelectDate?: (date: string) => void;
}

export default function Calendar({ onSelectDate }: CalendarProps) {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
        // Mismo criterio que la cola de producción, para que el contador del
        // día coincida con los pedidos que se listan al seleccionarlo.
        const pendingOrders = (data.orders ?? []).filter(
          (order: Order) =>
            order.status === "pendiente" || order.status === "en_produccion",
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

  useEffect(() => {
    onSelectDate?.(toISODate(year, month, selectedDate));
  }, [year, month, selectedDate, onSelectDate]);

  const firstDay = new Date(year, month, 1).getDay();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
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

  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const getOrdersForDay = (day: number) => {
    return orders.filter((order) => {
      const date = order.delivery_date.split("T")[0];
      const [orderYear, orderMonth, orderDay] = date.split("-").map(Number);
      return orderYear === year && orderMonth === month + 1 && orderDay === day;
    });
  };

  const selectedDayOrders = getOrdersForDay(selectedDate);

  return (
    <div className="flex flex-col text-white">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
            Agenda de entregas
          </p>

          <div className="flex items-baseline gap-2">
            <h2 className="text-2xl font-black uppercase tracking-[-0.04em] text-white">
              {months[month]}
            </h2>

            <span className="text-sm font-bold text-zinc-600">{year}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={previousMonth}
            aria-label="Mes anterior"
            className="
            flex h-9 w-9 items-center justify-center
            rounded-lg
            border border-white/[0.08]
            bg-white/[0.04]
            text-sm font-black text-zinc-500
            transition-all
            hover:border-[#FFD21C]/40
            hover:bg-[#FFD21C]/10
            hover:text-[#FFD21C]
          "
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="
            h-9 rounded-lg
            bg-[#FFD21C]
            px-3
            text-[10px]
            font-black
            uppercase
            tracking-wider
            text-black
            transition-all
            hover:bg-[#FF7A00]
            hover:text-white
          "
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={nextMonth}
            aria-label="Mes siguiente"
            className="
            flex h-9 w-9 items-center justify-center
            rounded-lg
            border border-white/[0.08]
            bg-white/[0.04]
            text-sm font-black text-zinc-500
            transition-all
            hover:border-[#FFD21C]/40
            hover:bg-[#FFD21C]/10
            hover:text-[#FFD21C]
          "
          >
            →
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 border-b border-white/[0.07] pb-2">
        {daysOfWeek.map((day, index) => (
          <div
            key={day}
            className={`
            text-center
            text-[9px]
            font-black
            uppercase
            tracking-wider
            ${index >= 5 ? "text-zinc-700" : "text-zinc-500"}
          `}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="min-h-[42px]" />;
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
              group
              relative
              flex
              min-h-[42px]
              flex-col
              items-center
              justify-center
              rounded-lg
              border
              text-xs
              font-bold
              transition-all
              duration-200

              ${
                isSelected
                  ? `
                    border-[#FFD21C]
                    bg-[#FFD21C]
                    text-black
                    shadow-[0_0_18px_rgba(255,210,28,0.18)]
                  `
                  : hasOrders
                    ? `
                      border-[#FF7A00]/30
                      bg-[#FF7A00]/10
                      text-[#FFB15C]
                      hover:border-[#FF7A00]/60
                      hover:bg-[#FF7A00]/20
                      hover:text-[#FFD21C]
                    `
                    : `
                      border-white/[0.04]
                      bg-white/[0.025]
                      text-zinc-400
                      hover:border-white/[0.10]
                      hover:bg-white/[0.07]
                      hover:text-white
                    `
              }
            `}
            >
              {/* NÚMERO */}
              <span
                className={`
                relative z-10
                ${isSelected ? "font-black text-black" : ""}
              `}
              >
                {day}
              </span>

              {/* PEDIDO */}
              {hasOrders && (
                <span
                  className={`
                  absolute
                  bottom-1
                  h-1
                  w-1
                  rounded-full
                  ${
                    isSelected
                      ? "bg-[#FF3030]"
                      : "bg-[#FF7A00] shadow-[0_0_6px_rgba(255,122,0,0.7)]"
                  }
                `}
                />
              )}

              {/* CANTIDAD */}
              {dayOrders.length > 1 && (
                <span
                  className={`
                  absolute
                  right-1.5
                  top-1
                  text-[8px]
                  font-black
                  ${isSelected ? "text-black/60" : "text-[#FF9A45]"}
                `}
                >
                  {dayOrders.length}
                </span>
              )}

              {/* HOY */}
              {isToday && !isSelected && (
                <span
                  className="
                  absolute
                  left-1.5
                  top-1.5
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-[#FF3030]
                  shadow-[0_0_7px_rgba(255,48,48,0.8)]
                "
                />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="mt-3 border-t border-white/[0.07] pt-3">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            Cargando pedidos...
          </p>
        </div>
      )}

      {!loading && (
        <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
              Fecha seleccionada
            </p>

            <p className="mt-0.5 text-xs font-bold text-zinc-300">
              {selectedDate} de {months[month]}
            </p>
          </div>

          <div
            className={`
            rounded-lg
            border
            px-3
            py-2
            ${
              selectedDayOrders.length > 0
                ? `
                  border-[#FF7A00]/30
                  bg-[#FF7A00]/15
                  text-[#FF9A45]
                `
                : `
                  border-white/[0.06]
                  bg-white/[0.03]
                  text-zinc-600
                `
            }
          `}
          >
            <span className="text-[10px] font-black uppercase tracking-wider">
              {selectedDayOrders.length === 0
                ? "Sin pedidos"
                : `${selectedDayOrders.length} pedido${
                    selectedDayOrders.length > 1 ? "s" : ""
                  }`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
