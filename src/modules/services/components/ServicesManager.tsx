"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Check, Pencil, Trash2, X } from "lucide-react";

import ServiceAddons from "./ServiceAddons";

interface Category {
  id: number;
  name: string;
}

interface Material {
  id: number;
  name: string;
}

interface ServiceRow {
  id: number;
  category_id: number | null;
  material_id: number | null;
  material_usage: number;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  image: string | null;
}

const UNITS = ["unidad", "m2", "metro", "minuto"];

const emptyDraft = {
  categoryId: "",
  materialId: "",
  materialUsage: "1",
  name: "",
  description: "",
  unit: "unidad",
  price: "0",
  image: "",
};

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

export default function ServicesManager() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Cuántos adicionales tiene cada servicio, para anunciarlos en la lista.
  const [addonCounts, setAddonCounts] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [
        servicesResponse,
        categoriesResponse,
        materialsResponse,
        addonsResponse,
      ] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/categories"),
        fetch("/api/materials"),
        fetch("/api/services/addons"),
      ]);

      if (addonsResponse.ok) {
        setAddonCounts(
          (await addonsResponse.json()).reduce(
            (counts: Record<number, number>, addon: { service_id: number }) => ({
              ...counts,
              [addon.service_id]: (counts[addon.service_id] ?? 0) + 1,
            }),
            {},
          ),
        );
      }

      if (!servicesResponse.ok) {
        throw new Error("No se pudieron cargar los servicios");
      }

      setServices(await servicesResponse.json());

      if (categoriesResponse.ok) {
        setCategories(await categoriesResponse.json());
      }

      if (materialsResponse.ok) {
        setMaterials(await materialsResponse.json());
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

  function startEdit(service: ServiceRow) {
    setEditingId(service.id);
    setError(null);

    setDraft({
      categoryId: String(service.category_id ?? ""),
      materialId: String(service.material_id ?? ""),
      materialUsage: String(service.material_usage ?? 1),
      name: service.name,
      description: service.description ?? "",
      unit: service.unit,
      price: String(service.price),
      image: service.image ?? "",
    });
  }

  async function handleSave(id: number) {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: Number(draft.categoryId),
          material_id: draft.materialId ? Number(draft.materialId) : null,
          material_usage: Number(draft.materialUsage) || 1,
          name: draft.name,
          description: draft.description,
          unit: draft.unit,
          price: Number(draft.price),
          image: draft.image,
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
          : "No se pudo actualizar el servicio",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service: ServiceRow) {
    if (
      !confirm(
        `¿Eliminar el servicio "${service.name}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    try {
      setDeletingId(service.id);
      setError(null);

      const response = await fetch(`/api/services/${service.id}`, {
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
          : "No se pudo eliminar el servicio",
      );
    } finally {
      setDeletingId(null);
    }
  }

  const categoryName = (id: number | null) =>
    categories.find((category) => category.id === id)?.name ?? "Sin categoría";

  const materialName = (id: number | null) =>
    materials.find((material) => material.id === id)?.name ?? "Sin material";

  if (loading) {
    return <p className="py-6 text-xs text-zinc-500">Cargando servicios...</p>;
  }

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {services.length === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-600">
          Todavía no hay servicios registrados.
        </p>
      ) : (
        <ul className="space-y-2">
          {services.map((service) => {
            if (editingId === service.id) {
              return (
                <li
                  key={service.id}
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
                        <option value="">Seleccione una categoría</option>
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
                      Material que descuenta
                      <select
                        value={draft.materialId}
                        onChange={(e) =>
                          setDraft({ ...draft, materialId: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      >
                        <option value="">Sin material</option>
                        {materials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    {draft.materialId && (
                      <label className="text-[11px] text-zinc-500">
                        Material por cada {draft.unit}
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={draft.materialUsage}
                          onChange={(e) =>
                            setDraft({ ...draft, materialUsage: e.target.value })
                          }
                          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                        />
                        <span className="mt-1 block text-[10px] text-zinc-600">
                          Cuánto material gasta cada {draft.unit} vendido
                        </span>
                      </label>
                    )}

                    <label className="text-[11px] text-zinc-500">
                      Unidad de cobro
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

                    <label className="text-[11px] text-zinc-500 sm:col-span-2">
                      Precio por {draft.unit}
                      <input
                        type="number"
                        min="0"
                        value={draft.price}
                        onChange={(e) =>
                          setDraft({ ...draft, price: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-orange-400/50"
                      />
                    </label>
                  </div>

                  <ServiceAddons serviceId={service.id} onChange={load} />

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSave(service.id)}
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
                key={service.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/15"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">
                    {service.name}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                    {categoryName(service.category_id)} ·{" "}
                    {materialName(service.material_id)}
                    {service.material_id
                      ? ` · ${Number(service.material_usage)} por ${service.unit}`
                      : ""}
                  </p>
                </div>

                {addonCounts[service.id] > 0 && (
                  <span className="shrink-0 rounded-md border border-yellow-400/25 bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold text-yellow-200">
                    {addonCounts[service.id]}{" "}
                    {addonCounts[service.id] === 1
                      ? "adicional"
                      : "adicionales"}
                  </span>
                )}

                <p className="text-sm font-bold text-orange-300">
                  {formatMoney(Number(service.price))}
                  <span className="ml-1 text-[11px] font-normal text-zinc-500">
                    / {service.unit}
                  </span>
                </p>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(service)}
                    aria-label={`Editar ${service.name}`}
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-orange-500/10 hover:text-orange-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(service)}
                    disabled={deletingId === service.id}
                    aria-label={`Eliminar ${service.name}`}
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
