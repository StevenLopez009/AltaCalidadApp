"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
          material_id: Number(materialId),
          name,
          description,
          unit,
          price: Number(price),
          image,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      alert("Servicio creado");

      setCategoryId("");
      setName("");
      setDescription("");
      setUnit("m2");
      setPrice("");
      setImage("");
      setPreview("");
    } catch {
      alert("Error creando servicio");
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
