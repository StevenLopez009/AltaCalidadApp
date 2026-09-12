"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";

interface Addon {
  id: number;
  name: string;
  price: number;
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

export default function ServiceAddons({
  serviceId,
  onChange,
}: {
  serviceId: number;
  /** Avisa al listado para refrescar el contador de adicionales. */
  onChange?: () => void;
}) {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/services/addons?serviceId=${serviceId}`,
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar los adicionales");
      }

      setAddons(await response.json());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Error cargando",
      );
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/services/addons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, name, price: Number(price) || 0 }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo crear");
      }

      setName("");
      setPrice("");
      await load();
      onChange?.();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "No se pudo crear el adicional",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: number) {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/services/addons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draftName,
          price: Number(draftPrice) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo actualizar");
      }

      setEditingId(null);
      await load();
      onChange?.();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "No se pudo actualizar",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(addon: Addon) {
    if (
      !confirm(
        `¿Eliminar el adicional "${addon.name}"? Los pedidos ya creados conservan su precio.`,
      )
    ) {
      return;
    }

    try {
      setError(null);

      const response = await fetch(`/api/services/addons/${addon.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message ?? "No se pudo eliminar");
      }

      await load();
      onChange?.();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar",
      );
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.04] p-3">
      <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-yellow-200">
        Adicionales del servicio
      </p>

      <p className="mb-2.5 text-[10px] text-zinc-500">
        Extras que se podrán sumar a este servicio al crear un pedido
      </p>

      {error && (
        <p className="mb-2 text-[11px] text-red-300">{error}</p>
      )}

      {loading ? (
        <p className="text-[11px] text-zinc-600">Cargando...</p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {addons.length === 0 && (
            <li className="text-[11px] text-zinc-600">
              Sin adicionales. Agrega, por ejemplo, ojales o instalación.
            </li>
          )}

          {addons.map((addon) => (
            <li key={addon.id}>
              {editingId === addon.id ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-orange-400/50"
                  />

                  <input
                    type="number"
                    min="0"
                    value={draftPrice}
                    onChange={(e) => setDraftPrice(e.target.value)}
                    className="w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none focus:border-orange-400/50"
                  />

                  <button
                    type="button"
                    onClick={() => handleUpdate(addon.id)}
                    disabled={saving}
                    aria-label="Guardar adicional"
                    className="rounded-lg bg-orange-500 p-1.5 text-white transition hover:bg-orange-400 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label="Cancelar"
                    className="rounded-lg border border-white/10 p-1.5 text-zinc-400 transition hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(addon.id);
                      setDraftName(addon.name);
                      setDraftPrice(String(addon.price));
                    }}
                    className="min-w-0 flex-1 truncate text-left text-xs text-zinc-300 transition hover:text-white"
                  >
                    {addon.name}
                  </button>

                  <span className="shrink-0 text-xs font-semibold text-orange-300">
                    {formatMoney(Number(addon.price))}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(addon)}
                    aria-label={`Eliminar ${addon.name}`}
                    className="shrink-0 rounded-lg p-1 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Ojales metálicos"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
        />

        <input
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio"
          className="w-24 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/50"
        />

        <button
          type="button"
          onClick={handleCreate}
          disabled={saving || !name.trim()}
          className="flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-500/15 px-2.5 py-1.5 text-[11px] font-bold text-orange-300 transition hover:bg-orange-500/25 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar
        </button>
      </div>
    </div>
  );
}
