"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface Material {
  id: number;
  name: string;
}

export function ServiceForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [materialId, setMaterialId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unit, setUnit] = useState("m2");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  // Los adicionales se guardan en memoria y se crean cuando el servicio ya
  // existe: necesitan su id.
  const [addons, setAddons] = useState<{ name: string; price: string }[]>([]);
  const [addonName, setAddonName] = useState("");
  const [addonPrice, setAddonPrice] = useState("");

  // Cuánto material gasta cada unidad vendida (1 si se miden igual).
  const [materialUsage, setMaterialUsage] = useState("1");

  function addAddon() {
    const name = addonName.trim();

    if (!name) return;

    setAddons((current) => [...current, { name, price: addonPrice || "0" }]);
    setAddonName("");
    setAddonPrice("");
  }

  function removeAddon(index: number) {
    setAddons((current) => current.filter((_, i) => i !== index));
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setMaterials([]);
      setMaterialId("");
      return;
    }

    loadMaterials();
  }, [categoryId]);

  async function loadCategories() {
    const response = await fetch("/api/categories");
    const data = await response.json();

    setCategories(data);
  }

  async function loadMaterials() {
    try {
      const response = await fetch(`/api/materials?categoryId=${categoryId}`);

      if (!response.ok) {
        throw new Error();
      }

      const data = await response.json();

      setMaterials(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

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
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: Number(categoryId),
          material_id: materialId ? Number(materialId) : null,
          material_usage: Number(materialUsage) || 1,
          name,
          description,
          unit,
          price: Number(price),
          image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Error creando servicio");
      }

      // Ya con el id del servicio se registran sus adicionales.
      const failed: string[] = [];

      for (const addon of addons) {
        const addonResponse = await fetch("/api/services/addons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: data.id,
            name: addon.name,
            price: Number(addon.price) || 0,
          }),
        });

        if (!addonResponse.ok) {
          failed.push(addon.name);
        }
      }

      alert(
        failed.length > 0
          ? `Servicio creado, pero no se pudieron guardar: ${failed.join(", ")}`
          : "Servicio creado",
      );

      setCategoryId("");
      setName("");
      setDescription("");
      setUnit("m2");
      setPrice("");
      setImage("");
      setPreview("");
      setAddons([]);
      setMaterialId("");
      setMaterialUsage("1");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error creando servicio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Categoría */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Categoría</label>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="
        w-full rounded-xl
        border border-white/10
        bg-[#0B0914]
        px-4 py-3
        text-sm text-white
        outline-none
        transition-all
        focus:border-orange-500/60
        focus:ring-2
        focus:ring-orange-500/10
      "
          required
        >
          <option value="" className="bg-[#0B0914]">
            Selecciona una categoría
          </option>

          {categories.map((category) => (
            <option
              key={category.id}
              value={category.id}
              className="bg-[#0B0914]"
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nombre */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Nombre del servicio
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Diseño e impresión de pendones"
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
        <label className="text-sm font-medium text-white/80">Descripción</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el servicio..."
          rows={3}
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

      {/* Unidad + Precio */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Unidad de cobro
          </label>

          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="
          w-full rounded-xl
          border border-white/10
          bg-[#0B0914]
          px-4 py-3
          text-sm text-white
          outline-none
          transition-all
          focus:border-orange-500/60
          focus:ring-2
          focus:ring-orange-500/10
        "
          >
            <option value="unidad">Unidad</option>
            <option value="m2">Metro cuadrado</option>
            <option value="metro">Metro</option>
            <option value="minuto">Minuto</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Precio</label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-white/30">
              $
            </span>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="
            w-full rounded-xl
            border border-white/10
            bg-[#0B0914]
            py-3 pl-9 pr-4
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
        </div>
      </div>

      {/* Material */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Material asociado
        </label>

        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="
        w-full rounded-xl
        border border-white/10
        bg-[#0B0914]
        px-4 py-3
        text-sm text-white
        outline-none
        transition-all
        focus:border-orange-500/60
        focus:ring-2
        focus:ring-orange-500/10
      "
        >
          <option value="" className="bg-[#0B0914]">
            Selecciona un material
          </option>

          {materials.map((material) => (
            <option
              key={material.id}
              value={material.id}
              className="bg-[#0B0914]"
            >
              {material.name}
            </option>
          ))}
        </select>
      </div>

      {/* Imagen */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Imagen del servicio
        </label>

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
          file:rounded-lg
          file:border-0
          file:bg-orange-500/10
          file:px-4
          file:py-2
          file:text-sm
          file:font-medium
          file:text-orange-400
          hover:file:bg-orange-500/20
          file:cursor-pointer
        "
          />
        </div>

        {preview && (
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
            <img
              src={preview}
              alt="Vista previa"
              className="h-36 w-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Consumo de material */}
      {materialId && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">
            Material por cada {unit}
          </label>

          <input
            type="number"
            min="0"
            step="any"
            value={materialUsage}
            onChange={(e) => setMaterialUsage(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3 text-sm text-white outline-none transition-all focus:border-orange-500/40"
          />

          <p className="text-xs text-white/30">
            Cuánto material gasta cada {unit} vendido. Déjalo en 1 si el
            servicio y el material se miden igual.
          </p>
        </div>
      )}

      {/* Adicionales */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">
          Adicionales <span className="text-white/30">(opcional)</span>
        </label>

        <p className="text-xs text-white/30">
          Extras que el cliente puede sumar al pedido, como ojales o
          instalación.
        </p>

        {addons.length > 0 && (
          <ul className="space-y-1.5 pt-1">
            {addons.map((addon, index) => (
              <li
                key={`${addon.name}-${index}`}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0B0914] px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm text-white">
                  {addon.name}
                </span>

                <span className="shrink-0 text-sm font-semibold text-orange-300">
                  ${Number(addon.price || 0).toLocaleString("es-CO")}
                </span>

                <button
                  type="button"
                  onClick={() => removeAddon(index)}
                  aria-label={`Quitar ${addon.name}`}
                  className="shrink-0 rounded-lg p-1 text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <input
            value={addonName}
            onChange={(e) => setAddonName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAddon();
              }
            }}
            placeholder="Ej: Ojales metálicos"
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-orange-500/40"
          />

          <input
            type="number"
            min="0"
            value={addonPrice}
            onChange={(e) => setAddonPrice(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAddon();
              }
            }}
            placeholder="Precio"
            className="w-28 rounded-xl border border-white/10 bg-[#0B0914] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/20 focus:border-orange-500/40"
          />

          <button
            type="button"
            onClick={addAddon}
            disabled={!addonName.trim()}
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/15 px-4 py-3 text-sm font-semibold text-orange-300 transition hover:bg-orange-500/25 disabled:opacity-40"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>
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
        {loading ? "Guardando..." : "Crear servicio"}
      </button>
    </form>
  );
}
