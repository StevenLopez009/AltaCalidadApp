"use client";

import { useEffect, useMemo, useState } from "react";

interface Material {
  id: number;
  category_id: number;
  name: string;
  description: string;
  unit: string;
  stock: number;
  minimum_stock: number;
  unit_cost: number;
}

type InventoryState = "normal" | "bajo" | "agotado";

export default function InventoryStatus() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      try {
        setLoading(true);

        const response = await fetch("/api/materials");

        if (!response.ok) {
          throw new Error("Error obteniendo inventario");
        }

        const data = await response.json();

        setMaterials(data);
      } catch (error) {
        console.error("Error cargando inventario:", error);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    }

    loadInventory();
  }, []);

  function getInventoryState(material: Material): InventoryState {
    const stock = Number(material.stock);
    const minimumStock = Number(material.minimum_stock);

    if (stock <= 0) {
      return "agotado";
    }

    if (stock <= minimumStock) {
      return "bajo";
    }

    return "normal";
  }

  const statistics = useMemo(() => {
    const normal = materials.filter(
      (material) => getInventoryState(material) === "normal",
    ).length;

    const bajo = materials.filter(
      (material) => getInventoryState(material) === "bajo",
    ).length;

    const agotado = materials.filter(
      (material) => getInventoryState(material) === "agotado",
    ).length;

    return {
      normal,
      bajo,
      agotado,
      total: materials.length,
    };
  }, [materials]);

  function getStockPercentage(material: Material) {
    const stock = Number(material.stock);
    const minimumStock = Number(material.minimum_stock);

    if (minimumStock <= 0) {
      return 100;
    }

    const percentage = (stock / (minimumStock * 3)) * 100;

    return Math.min(Math.max(percentage, 0), 100);
  }

  function getStateStyle(state: InventoryState) {
    const styles = {
      normal: {
        label: "Normal",
        text: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20",
        bar: "bg-green-500",
      },

      bajo: {
        label: "Stock bajo",
        text: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20",
        bar: "bg-yellow-500",
      },

      agotado: {
        label: "Agotado",
        text: "text-red-400",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        bar: "bg-red-500",
      },
    };

    return styles[state];
  }

  if (loading) {
    return (
      <section className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">Cargando inventario...</p>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col p-5">
      {/* HEADER */}
      <div className="mb-4 flex shrink-0 items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">
            Estado del inventario
          </h2>

          <p className="mt-1 text-[11px] text-gray-500">
            Resumen del stock actual
          </p>
        </div>

        <span className="rounded-lg bg-purple-500/10 px-2.5 py-1 text-[10px] text-purple-400">
          {statistics.total} materiales
        </span>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="mb-4 grid shrink-0 grid-cols-3 gap-2">
        {/* NORMAL */}
        <div className="rounded-xl border border-green-500/10 bg-green-500/5 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <span className="text-[10px] text-gray-400">Normal</span>
          </div>

          <p className="mt-1 text-xl font-bold text-green-400">
            {statistics.normal}
          </p>
        </div>

        {/* BAJO */}
        <div className="rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-yellow-500" />

            <span className="text-[10px] text-gray-400">Bajo</span>
          </div>

          <p className="mt-1 text-xl font-bold text-yellow-400">
            {statistics.bajo}
          </p>
        </div>

        {/* AGOTADO */}
        <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-[10px] text-gray-400">Agotado</span>
          </div>

          <p className="mt-1 text-xl font-bold text-red-400">
            {statistics.agotado}
          </p>
        </div>
      </div>

      {/* LISTA */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {materials.map((material) => {
          const state = getInventoryState(material);
          const style = getStateStyle(state);
          const percentage = getStockPercentage(material);

          return (
            <div key={material.id}>
              {/* INFO */}
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p
                    className="truncate text-xs font-medium text-white"
                    title={material.name}
                  >
                    {material.name}
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Mínimo: {material.minimum_stock} {material.unit}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {material.stock} {material.unit}
                  </span>

                  <span
                    className={`
                      rounded-full
                      border
                      px-2
                      py-0.5
                      text-[9px]
                      font-medium
                      ${style.bg}
                      ${style.border}
                      ${style.text}
                    `}
                  >
                    {style.label}
                  </span>
                </div>
              </div>

              {/* BARRA */}
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full transition-all ${style.bar}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}

        {materials.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-gray-500">
              No hay materiales registrados.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
