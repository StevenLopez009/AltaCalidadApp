"use client";

import { useEffect, useState } from "react";
import { Check, Pencil, X } from "lucide-react";

import {
  DEFAULT_HERO_TITLE,
  splitHeroTitle,
} from "@/src/modules/settings/heroTitle";

export default function HeroTitleEditor() {
  const [title, setTitle] = useState(DEFAULT_HERO_TITLE);
  const [draft, setDraft] = useState(DEFAULT_HERO_TITLE);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTitle() {
      try {
        const response = await fetch("/api/site-settings");

        if (!response.ok) {
          throw new Error("No se pudo cargar el título");
        }

        const data = await response.json();

        if (typeof data.heroTitle === "string") {
          setTitle(data.heroTitle);
          setDraft(data.heroTitle);
        }
      } catch (loadError) {
        console.error("Error cargando el título del encabezado:", loadError);
      }
    }

    loadTitle();
  }, []);

  async function handleSave() {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroTitle: draft }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo guardar el título");
      }

      setTitle(data.heroTitle);
      setDraft(data.heroTitle);
      setEditing(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el título",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(title);
    setError(null);
    setEditing(false);
  }

  const lines = splitHeroTitle(title);

  if (editing) {
    return (
      <div className="max-w-xl">
        <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          Una línea por renglón
        </label>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          autoFocus
          disabled={saving}
          className="w-full rounded-2xl border border-white/15 bg-black/40 p-4 text-2xl font-black uppercase leading-[1.05] tracking-[-0.03em] text-white outline-none transition focus:border-[#FFD21C]/60 disabled:opacity-50 sm:text-3xl"
        />

        {error && (
          <p className="mt-2 text-xs font-semibold text-[#FF6B6B]">{error}</p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#FFD21C] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#FF7A00] hover:text-white disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-400 transition hover:text-white disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancelar
          </button>

          <span className="text-[11px] text-zinc-600">
            Se muestra en la página principal
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="group/title relative">
      <h1 className="max-w-xl text-[2.15rem] font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
        {lines.map((line, index) => (
          <span
            key={`${line}-${index}`}
            className={
              index === lines.length - 1 ? "block text-[#FFD21C]" : "block"
            }
          >
            {line}
          </span>
        ))}
      </h1>

      <button
        type="button"
        onClick={() => setEditing(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-zinc-400 transition hover:border-[#FFD21C]/40 hover:text-[#FFD21C]"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar título
      </button>
    </div>
  );
}
