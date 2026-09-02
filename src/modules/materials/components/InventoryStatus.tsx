"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Material {
  id: number;
  category_id: number;
  name: string;
  description?: string;
  unit: string;
  stock: number;
  minimum_stock: number;
  unit_cost: number;
}

type InventoryState = "normal" | "bajo" | "agotado";

interface ChartMaterial {
  id: number;
  name: string;
  unit: string;
  stock: number;
  minimum_stock: number;
  state: InventoryState;
}

export default function InventoryStatus() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch("/api/materials");
        const data = await response.json();

        if (Array.isArray(data)) {
          setMaterials(data);
        }
      } catch (error) {
        console.error("Error cargando inventario:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const getInventoryState = (
    stock: number,
    minimum: number,
  ): InventoryState => {
    if (stock <= 0) return "agotado";
    if (stock <= minimum) return "bajo";
    return "normal";
  };

  const chartData = useMemo<ChartMaterial[]>(() => {
    return materials.map((material) => {
      const stock = Number(material.stock) || 0;
      const minimum_stock = Number(material.minimum_stock) || 0;

      return {
        id: material.id,
        name: material.name,
        unit: material.unit,
        stock,
        minimum_stock,
        state: getInventoryState(stock, minimum_stock),
      };
    });
  }, [materials]);

  const stats = useMemo(() => {
    return {
      normal: chartData.filter((item) => item.state === "normal").length,
      bajo: chartData.filter((item) => item.state === "bajo").length,
      agotado: chartData.filter((item) => item.state === "agotado").length,
      total: chartData.length,
    };
  }, [chartData]);

  const maxStock = useMemo(() => {
    const highest = Math.max(...chartData.map((item) => item.stock), 0);

    // Normalmente trabajamos con un máximo visual de 120.
    // Si existe algo mayor, ampliamos automáticamente.
    if (highest <= 120) return 120;

    return Math.ceil(highest / 20) * 20;
  }, [chartData]);

  const getBarColor = (state: InventoryState) => {
    switch (state) {
      case "agotado":
        return "#ef4444";

      case "bajo":
        return "#eab308";

      default:
        return "#f97316";
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-orange-500/20 border-t-orange-500" />
      </div>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col p-5">
      {/* HEADER */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Estado del inventario
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Stock actual de materiales
          </p>
        </div>

        <div className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
          {stats.total} materiales
        </div>
      </div>

      {/* STATS */}
      <div className="mb-4 grid shrink-0 grid-cols-3 gap-3">
        <div className="rounded-xl border border-orange-500/10 bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
            Normal
          </p>

          <p className="mt-1 text-xl font-semibold text-orange-400">
            {stats.normal}
          </p>
        </div>

        <div className="rounded-xl border border-yellow-500/10 bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
            Stock bajo
          </p>

          <p className="mt-1 text-xl font-semibold text-yellow-400">
            {stats.bajo}
          </p>
        </div>

        <div className="rounded-xl border border-red-500/10 bg-white/[0.025] p-3">
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">
            Agotado
          </p>

          <p className="mt-1 text-xl font-semibold text-red-400">
            {stats.agotado}
          </p>
        </div>
      </div>

      {/* CHART */}
      <div className="min-h-[240px] flex-1 rounded-xl border border-orange-500/10 bg-black/10 p-3">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No hay materiales registrados.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={220}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 15,
                left: 0,
                bottom: 35,
              }}
              barCategoryGap="25%"
            >
              <CartesianGrid
                vertical={false}
                stroke="rgba(249,115,22,0.08)"
                strokeDasharray="4 4"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                interval={0}
                height={50}
                tick={{
                  fill: "#71717a",
                  fontSize: 10,
                }}
                tickFormatter={(value) => {
                  const text = String(value);

                  return text.length > 11
                    ? `${text.substring(0, 11)}...`
                    : text;
                }}
              />

              <YAxis
                domain={[0, maxStock]}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
                tick={{
                  fill: "#71717a",
                  fontSize: 10,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(249,115,22,0.05)",
                }}
                contentStyle={{
                  background: "#16120F",
                  border: "1px solid rgba(249,115,22,0.25)",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                }}
                labelStyle={{
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 4,
                }}
                itemStyle={{
                  color: "#fb923c",
                  fontSize: 12,
                }}
                formatter={(value) => [`${value}`, "Stock actual"]}
              />

              <Bar
                dataKey="stock"
                radius={[7, 7, 2, 2]}
                maxBarSize={42}
                minPointSize={3}
              >
                {chartData.map((item) => (
                  <Cell key={item.id} fill={getBarColor(item.state)} />
                ))}

                <LabelList
                  dataKey="stock"
                  position="top"
                  fill="#a1a1aa"
                  fontSize={9}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* LEGEND */}
      <div className="mt-3 flex shrink-0 justify-center gap-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
          <span className="text-[10px] text-zinc-500">Normal</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
          <span className="text-[10px] text-zinc-500">Bajo</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
          <span className="text-[10px] text-zinc-500">Agotado</span>
        </div>
      </div>
    </section>
  );
}
