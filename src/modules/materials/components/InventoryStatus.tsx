"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
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
  coverage: number;
  barValue: number;
  state: InventoryState;
}

const COVERAGE_CAP = 300;

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
    return materials
      .map((material) => {
        const stock = Number(material.stock) || 0;
        const minimum_stock = Number(material.minimum_stock) || 0;

        // Los materiales se miden en unidades distintas (m2, litros, unidades),
        // así que comparar el stock en bruto no dice nada. La cobertura sobre
        // el mínimo sí es comparable: 100% = justo en el punto de reposición.
        const coverage =
          minimum_stock > 0
            ? Math.round((stock / minimum_stock) * 100)
            : stock > 0
              ? 999
              : 0;

        return {
          id: material.id,
          name: material.name,
          unit: material.unit,
          stock,
          minimum_stock,
          coverage,
          // La barra se recorta para que un material muy surtido no deje al
          // resto pegado al eje; el tooltip conserva la cifra real.
          barValue: Math.min(coverage, COVERAGE_CAP),
          state: getInventoryState(stock, minimum_stock),
        };
      })
      .sort((a, b) => a.coverage - b.coverage);
  }, [materials]);

  const stats = useMemo(() => {
    return {
      normal: chartData.filter((item) => item.state === "normal").length,
      bajo: chartData.filter((item) => item.state === "bajo").length,
      agotado: chartData.filter((item) => item.state === "agotado").length,
      total: chartData.length,
    };
  }, [chartData]);

  // Recorta la escala para que un material muy surtido no aplaste al resto.
  const maxCoverage = useMemo(() => {
    const highest = Math.max(...chartData.map((item) => item.barValue), 0);

    return Math.max(Math.ceil(highest / 50) * 50, 150);
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
              layout="vertical"
              margin={{ top: 14, right: 48, left: 4, bottom: 6 }}
              barCategoryGap="22%"
            >
              <CartesianGrid
                horizontal={false}
                stroke="rgba(249,115,22,0.08)"
              />

              <XAxis
                type="number"
                domain={[0, maxCoverage]}
                allowDataOverflow
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />

              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                width={124}
                interval={0}
                // Recharts parte el texto en varias líneas y con muchos
                // materiales los nombres se solapan: se fuerza una sola línea.
                tick={({ x, y, payload }) => {
                  const text = String(payload.value);

                  return (
                    <text
                      x={x}
                      y={y}
                      dy={3}
                      textAnchor="end"
                      fill="#a1a1aa"
                      fontSize={10}
                    >
                      {text.length > 19 ? `${text.substring(0, 19)}…` : text}
                    </text>
                  );
                }}
              />

              {/* El mínimo es el umbral de reposición: a la izquierda, falta material. */}
              <ReferenceLine
                x={100}
                stroke="#eab308"
                strokeDasharray="4 4"
                label={{
                  value: "mínimo",
                  position: "insideTopRight",
                  fill: "#eab308",
                  fontSize: 9,
                  offset: 8,
                }}
              />

              <Tooltip
                cursor={{ fill: "rgba(249,115,22,0.05)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;

                  const item = payload[0].payload as ChartMaterial;

                  const labels: Record<InventoryState, string> = {
                    normal: "Stock normal",
                    bajo: "Stock bajo",
                    agotado: "Agotado",
                  };

                  return (
                    <div className="rounded-xl border border-orange-500/25 bg-[#16120F] px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <p className="mb-1.5 text-xs font-semibold text-white">
                        {item.name}
                      </p>

                      <p className="text-[11px] text-zinc-400">
                        Disponible:{" "}
                        <span className="font-semibold text-white">
                          {item.stock} {item.unit}
                        </span>
                      </p>

                      <p className="text-[11px] text-zinc-400">
                        Mínimo:{" "}
                        <span className="font-semibold text-white">
                          {item.minimum_stock} {item.unit}
                        </span>
                      </p>

                      <p
                        className="mt-1.5 text-[11px] font-bold"
                        style={{ color: getBarColor(item.state) }}
                      >
                        {labels[item.state]} · {item.coverage}% del mínimo
                      </p>
                    </div>
                  );
                }}
              />

              <Bar dataKey="barValue" radius={[2, 7, 7, 2]} maxBarSize={18}>
                {chartData.map((item) => (
                  <Cell key={item.id} fill={getBarColor(item.state)} />
                ))}

                <LabelList
                  dataKey="coverage"
                  position="right"
                  fill="#a1a1aa"
                  fontSize={9}
                  formatter={(value) => `${value ?? 0}%`}
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
