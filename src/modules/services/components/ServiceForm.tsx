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
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
    >
      <h2 className="text-3xl font-black uppercase text-white">
        Nuevo Servicio
      </h2>

      {/* Categoría */}

      <div className="mt-6">
        <label className="text-sm text-white/60">Categoría</label>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
          required
        >
          <option value="">Seleccione...</option>

          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nombre */}

      <div className="mt-5">
        <label className="text-sm text-white/60">Nombre</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
          required
        />
      </div>

      {/* Descripción */}

      <div className="mt-5">
        <label className="text-sm text-white/60">Descripción</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-2 h-32 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
          required
        />
      </div>

      {/* Unidad de venta */}

      <div className="mt-5">
        <label className="text-sm text-white/60">Unidad de venta</label>

        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
          required
        >
          <option value="m2">Metro cuadrado (m²)</option>
          <option value="metro">Metro lineal (m)</option>
          <option value="unidad">Unidad</option>
          <option value="rollo">Rollo</option>
          <option value="hoja">Hoja</option>
          <option value="kg">Kilogramo (Kg)</option>
          <option value="litro">Litro (L)</option>
          <option value="minuto">Minuto</option>
          <option value="hora">Hora</option>
        </select>
      </div>

      <div className="mt-5">
        <label className="text-sm text-white/60">Material</label>

        <select
          value={materialId}
          onChange={(e) => setMaterialId(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
          required
        >
          <option value="">Seleccione...</option>

          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.name}
            </option>
          ))}
        </select>
      </div>

      {/* Precio */}

      <div className="mt-5">
        <label className="text-sm text-white/60">Precio</label>

        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white"
          required
        />
      </div>

      {/* Imagen */}

      <div className="mt-5">
        <label className="text-sm text-white/60">Imagen</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 p-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-orange-500 file:px-4 file:py-2 file:font-semibold file:text-white"
        />

        {preview && (
          <div className="relative mt-5 h-60 overflow-hidden rounded-2xl">
            <Image src={preview} alt="Preview" fill className="object-cover" />
          </div>
        )}
      </div>

      <button
        disabled={loading}
        className="mt-8 w-full rounded-xl bg-orange-500 py-3 font-bold uppercase text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Crear servicio"}
      </button>
    </form>
  );
}
