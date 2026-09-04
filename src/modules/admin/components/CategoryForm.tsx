"use client";

import { useEffect, useState } from "react";
import { FolderPlus, Layers3, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

export function CategoryForm() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Error obteniendo categorías");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCategories(false);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("No se pudo subir la imagen");
        return;
      }

      const data = await response.json();

      setImage(data.url);
    } catch (error) {
      console.error(error);
      alert("Error subiendo la imagen");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error("Error creando categoría");
      }

      setName("");
      setDescription("");
      setImage("");
      setPreview("");

      await loadCategories();

      alert("Categoría creada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error creando categoría");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl border border-orange-500/20 bg-[#15100D] shadow-xl shadow-orange-500/5 lg:grid-cols-2">
      {/* =====================================================
          FORMULARIO
      ===================================================== */}
      <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
        {/* Header */}
        <div className="mb-7 flex items-center gap-3">
          <div
            className="
              flex h-11 w-11 items-center justify-center
              rounded-xl
              border border-orange-500/20
              bg-orange-500/10
              text-orange-400
            "
          >
            <FolderPlus size={21} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">Nueva categoría</h2>

            <p className="text-sm text-white/40">
              Agrega una nueva categoría al catálogo
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Nombre de la categoría
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Impresión digital"
              className="
                w-full rounded-xl
                border border-white/10
                bg-[#0B0914]
                px-4 py-3
                text-sm text-white
                placeholder:text-white/25
                outline-none
                transition-all
                focus:border-orange-500/60
                focus:ring-2
                focus:ring-orange-500/10
              "
              required
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              Descripción
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente la categoría..."
              rows={4}
              className="
                w-full resize-none rounded-xl
                border border-white/10
                bg-[#0B0914]
                px-4 py-3
                text-sm text-white
                placeholder:text-white/25
                outline-none
                transition-all
                focus:border-orange-500/60
                focus:ring-2
                focus:ring-orange-500/10
              "
            />
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Imagen</label>

            <div
              className="
                rounded-xl
                border border-dashed border-white/10
                bg-[#0B0914]/70
                p-4
                transition-all
                hover:border-orange-500/30
              "
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="
                  block w-full
                  text-sm text-white/50
                  file:mr-4
                  file:cursor-pointer
                  file:rounded-lg
                  file:border-0
                  file:bg-orange-500/10
                  file:px-4
                  file:py-2
                  file:text-sm
                  file:font-medium
                  file:text-orange-400
                  hover:file:bg-orange-500/20
                "
              />
            </div>

            {preview && (
              <div className="mt-3 overflow-hidden rounded-xl border border-orange-500/20">
                <img
                  src={preview}
                  alt="Vista previa"
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full rounded-xl
              bg-gradient-to-r
              from-orange-500
              to-red-500
              px-5 py-3
              text-sm font-semibold text-white
              shadow-lg shadow-orange-500/10
              transition-all
              hover:-translate-y-0.5
              hover:shadow-orange-500/20
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {loading ? "Guardando..." : "Crear categoría"}
          </button>
        </form>
      </div>

      {/* =====================================================
          LISTADO DE CATEGORÍAS
      ===================================================== */}
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-11 w-11 items-center justify-center
                rounded-xl
                border border-orange-500/20
                bg-orange-500/10
                text-orange-400
              "
            >
              <Layers3 size={21} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Categorías</h2>

              <p className="text-sm text-white/40">Categorías disponibles</p>
            </div>
          </div>

          {/* Contador */}
          <div
            className="
              rounded-full
              border border-orange-500/20
              bg-orange-500/10
              px-3 py-1
              text-xs font-semibold
              text-orange-400
            "
          >
            {categories.length}
          </div>
        </div>

        {/* Lista */}
        {loadingCategories ? (
          <div className="flex min-h-[280px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <div
                className="
                  h-5 w-5 animate-spin rounded-full
                  border-2 border-orange-500/20
                  border-t-orange-500
                "
              />
              Cargando categorías...
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div
            className="
              flex min-h-[280px]
              flex-col items-center justify-center
              rounded-2xl
              border border-dashed border-white/10
              bg-[#0B0914]/50
              px-6 text-center
            "
          >
            <Layers3 size={36} className="mb-3 text-white/20" />

            <p className="text-sm font-medium text-white/60">
              No hay categorías
            </p>

            <p className="mt-1 text-xs text-white/30">
              Crea tu primera categoría usando el formulario.
            </p>
          </div>
        ) : (
          <div
            className="
    h-[420px]
    space-y-3
    overflow-y-auto
    pr-2
    scrollbar-thin
    scrollbar-track-transparent
    scrollbar-thumb-orange-500/30
    hover:scrollbar-thumb-orange-500/50
  "
          >
            {categories.map((category) => (
              <div
                key={category.id}
                className="
        group flex items-center gap-4
        rounded-2xl
        border border-white/10
        bg-[#0B0914]/70
        p-4
        transition-all
        hover:border-orange-500/30
        hover:bg-orange-500/[0.03]
      "
              >
                <div
                  className="
          flex h-12 w-12 shrink-0
          items-center justify-center
          overflow-hidden
          rounded-xl
          border border-orange-500/10
          bg-orange-500/10
        "
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Layers3 size={20} className="text-orange-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {category.name}
                  </h3>

                  {category.description ? (
                    <p className="mt-1 truncate text-xs text-white/40">
                      {category.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-white/20">
                      Sin descripción
                    </p>
                  )}
                </div>

                <span
                  className="
          hidden rounded-lg
          border border-white/5
          bg-white/[0.03]
          px-2 py-1
          text-[10px]
          text-white/30
          sm:block
        "
                >
                  #{category.id}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
