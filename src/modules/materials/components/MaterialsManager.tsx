"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Pencil, Trash2, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Material {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  unit: string;
  stock: number;
  minimum_stock: number;
  unit_cost: number;
}

const UNITS = ["unidad", "rollo", "m2", "metro", "hoja", "kg", "litro"];

const emptyDraft = {
  categoryId: "",
  name: "",
  description: "",
  unit: "unidad",
  stock: "0",
  minimumStock: "0",
  unitCost: "0",
};

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

export default function MaterialsManager() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [materialsResponse, categoriesResponse] = await Promise.all([
        fetch("/api/materials"),
        fetch("/api/categories"),
      ]);

      if (!materialsResponse.ok) {
        throw new Error("No se pudieron cargar los materiales");
      }

      setMaterials(await materialsResponse.json());

      if (categoriesResponse.ok) {
        setCategories(await categoriesResponse.json());
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Error cargando datos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(material: Material) {
    setEditingId(material.id);
    setError(null);

    setDraft({
      categoryId: String(material.category_id ?? ""),
      name: material.name,
      description: material.description ?? "",
      unit: material.unit,
      stock: String(material.stock),
      minimumStock: String(material.minimum_stock),
      unitCost: String(material.unit_cost),
    });
  }

  async function handleSave(id: number) {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/materials/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: Number(draft.categoryId),
          name: draft.name,
          description: draft.description,
          unit: draft.unit,
          stock: Number(draft.stock),
          minimumStock: Number(draft.minimumStock),
          unitCost: Number(draft.unitCost),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo actualizar");
      }

      setEditingId(null);
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo actualizar el material",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(material: Material) {
    if (
      !confirm(
        `¿Eliminar el material "${material.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(material.id);
      setError(null);

      const response = await fetch(`/api/materials/${material.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo eliminar");
      }

      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar el material",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const categoryName = (id: number | null) =>
    categories.find((category) => category.id === id)?.name ?? "Sin categoría";

  if (loading) {
    return <p className="py-6 text-xs text-zinc-500">Cargando materiales...</p>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {materials.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-600">
          Todavía no hay materiales registrados.
        </p>
      ) : (
        <ul className="space-y-2">
          {materials.map((material) => {
            // Mismo umbral que el panel de inventario: al llegar al mínimo
            // ya hay que reponer.
            const lowStock =
              Number(material.stock) <= Number(material.minimum_stock);

            if (editingId === material.id) {
              return (
                <li
                  key={material.id}
                  className="rounded-2xl border border-orange-500/30 bg-orange-500/[0.04] p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-[11px] text-zinc-500">
                      Nombre
                      <input
                        value={draft.name}
                        onChange={(e) =>
                          setDraft({ ...draft, name: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      />
                    </label>

                    <label className="text-[11px] text-zinc-500">
                      Categoría
                      <select
                        value={draft.categoryId}
                        onChange={(e) =>
                          setDraft({ ...draft, categoryId: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      >
                        <option value="">Sin categoría</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-[11px] text-zinc-500 sm:col-span-2">
                      Descripción
                      <input
                        value={draft.description}
                        onChange={(e) =>
                          setDraft({ ...draft, description: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      />
                    </label>

                    <label className="text-[11px] text-zinc-500">
                      Unidad
                      <select
                        value={draft.unit}
                        onChange={(e) =>
                          setDraft({ ...draft, unit: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      >
                        {UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-[11px] text-zinc-500">
                      Costo unitario
                      <input
                        type="number"
                        min="0"
                        value={draft.unitCost}
                        onChange={(e) =>
                          setDraft({ ...draft, unitCost: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      />
                    </label>

                    <label className="text-[11px] text-zinc-500">
                      Stock
                      <input
                        type="number"
                        min="0"
                        value={draft.stock}
                        onChange={(e) =>
                          setDraft({ ...draft, stock: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      />
                    </label>

                    <label className="text-[11px] text-zinc-500">
                      Stock mínimo
                      <input
                        type="number"
                        min="0"
                        value={draft.minimumStock}
                        onChange={(e) =>
                          setDraft({ ...draft, minimumStock: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(material.id)}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-400 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" />
                      {saving ? "Guardando..." : "Guardar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      disabled={saving}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancelar
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li
                key={material.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/15"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-white">
                      {material.name}
                    </p>

                    {lowStock && (
                      <span className="rounded-md border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-300">
                        Stock bajo
                      </span>
                    )}
                  </div>

                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {categoryName(material.category_id)} ·{" "}
                    {formatMoney(Number(material.unit_cost))} / {material.unit}
                  </p>
                </div>

                <div className="text-right text-[11px] text-zinc-500">
                  <span className={lowStock ? "text-red-300" : "text-zinc-300"}>
                    {Number(material.stock)}
                  </span>{" "}
                  / {Number(material.minimum_stock)} {material.unit}
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(material)}
                    aria-label={`Editar ${material.name}`}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-orange-500/10 hover:text-orange-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(material)}
                    disabled={deletingId === material.id}
                    aria-label={`Eliminar ${material.name}`}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
