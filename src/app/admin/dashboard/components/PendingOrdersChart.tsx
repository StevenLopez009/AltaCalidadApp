"use client";

import { useEffect, useState } from "react";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface Order {
  id: number;
  status:
    | "pendiente"
    | "en_produccion"
    | "terminado"
    | "entregado"
    | "cancelado";
}

export default function PendingOrdersChart() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getOrders() {
      try {
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-zinc-500">Cargando...</p>
      </div>
    );
  }

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pendiente",
  ).length;

  const otherOrders = totalOrders - pendingOrders;

  const percentage =
    totalOrders > 0 ? Math.round((pendingOrders / totalOrders) * 100) : 0;

  const data = [
    {
      name: "Pendientes",
      value: pendingOrders,
    },
    {
      name: "Otros",
      value: otherOrders,
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* HEADER */}
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-white">Pendientes</h2>

        <p className="text-xs text-zinc-500">
          Pedidos pendientes respecto al total
        </p>
      </div>

      {/* GRÁFICO */}
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={3}
              stroke="none"
            >
              {/* PENDIENTES */}
              <Cell fill="#f97316" />

              {/* OTROS */}
              <Cell fill="#29211a" />
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "#16120F",
                border: "1px solid rgba(249,115,22,.25)",
                borderRadius: "10px",
                color: "#fff",
              }}
              itemStyle={{
                color: "#fb923c",
              }}
              labelStyle={{
                color: "#a1a1aa",
              }}
              formatter={(value) => [value, "Pedidos"]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* CENTRO DEL DONUT */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{percentage}%</span>

          <span className="text-[10px] text-zinc-500">pendientes</span>
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="mt-2 flex items-center justify-between text-xs">
        {/* PENDIENTES */}
        <div className="flex items-center">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />

          <span className="text-zinc-400">Pendientes</span>

          <span className="ml-2 font-semibold text-orange-400">
            {pendingOrders}
          </span>
        </div>

        {/* TOTAL */}
        <div className="flex items-center">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#29211a]" />

          <span className="text-zinc-500">Total</span>

          <span className="ml-2 font-semibold text-white">{totalOrders}</span>
        </div>
      </div>
    </div>
  );
}
