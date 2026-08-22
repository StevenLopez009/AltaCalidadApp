"use client";

import { useEffect, useState } from "react";

interface Category {
  id: number;
  name: string;
}

export default function MaterialForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    unit: "unidad",
    stock: "",
    minimumStock: "",
    unitCost: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        throw new Error("Error obteniendo categorías");
      }

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("/api/materials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: Number(categoryId),
          name: form.name,
          description: form.description,
          unit: form.unit,
          stock: Number(form.stock),
          minimumStock: Number(form.minimumStock),
          unitCost: Number(form.unitCost),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      alert("Material creado correctamente");

      setCategoryId("");

      setForm({
        name: "",
        description: "",
        unit: "unidad",
        stock: "",
        minimumStock: "",
        unitCost: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error creando el material");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto rounded-3xl border border-purple-500/20 bg-[#161325] p-10 shadow-xl"
    >
      <h2 className="mb-8 text-3xl font-bold text-white">Crear Material</h2>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-white/60">Categoría</label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
            required
          >
            <option value="">Seleccione una categoría</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Nombre</label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-2 block text-sm text-gray-300">
            Descripción
          </label>

          <textarea
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">Unidad</label>

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
          >
            <option value="unidad">Unidad</option>
            <option value="rollo">Rollo</option>
            <option value="m2">Metro²</option>
            <option value="metro">Metro</option>
            <option value="hoja">Hoja</option>
            <option value="kg">Kg</option>
            <option value="litro">Litro</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Stock Inicial
          </label>

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Stock Mínimo
          </label>

          <input
            type="number"
            name="minimumStock"
            value={form.minimumStock}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Costo Unitario
          </label>

          <input
            type="number"
            name="unitCost"
            value={form.unitCost}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
          />
        </div>
      </div>

      <div className="mt-10 flex justify-end gap-4">
        <button
          type="button"
          className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-3 font-semibold text-white transition hover:scale-105"
        >
          Guardar Material
        </button>
      </div>
    </form>
  );
}
