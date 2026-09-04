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
      className="
        mx-auto max-w-5xl
        rounded-3xl
        border border-orange-500/20
        bg-[#15100D]
        p-10
        shadow-xl shadow-orange-500/5
      "
    >
      <h2 className="mb-8 text-3xl font-bold text-white">Crear Material</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Categoría */}
        <div>
          <label className="mb-2 block text-sm text-white/60">Categoría</label>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
            required
          >
            <option value="">Seleccione una categoría</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
                className="bg-[#1A120C]"
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre */}
        <div>
          <label className="mb-2 block text-sm text-white/60">Nombre</label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              placeholder:text-white/20
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
          />
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label className="mb-2 block text-sm text-white/60">
            Descripción
          </label>

          <textarea
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              resize-none
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
          />
        </div>

        {/* Unidad */}
        <div>
          <label className="mb-2 block text-sm text-white/60">Unidad</label>

          <select
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
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

        {/* Stock inicial */}
        <div>
          <label className="mb-2 block text-sm text-white/60">
            Stock Inicial
          </label>

          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
          />
        </div>

        {/* Stock mínimo */}
        <div>
          <label className="mb-2 block text-sm text-white/60">
            Stock Mínimo
          </label>

          <input
            type="number"
            name="minimumStock"
            value={form.minimumStock}
            onChange={handleChange}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
          />
        </div>

        {/* Costo */}
        <div>
          <label className="mb-2 block text-sm text-white/60">
            Costo Unitario
          </label>

          <input
            type="number"
            name="unitCost"
            value={form.unitCost}
            onChange={handleChange}
            className="
              w-full rounded-xl
              border border-orange-500/20
              bg-[#1A120C]
              p-3
              text-white
              outline-none
              transition
              focus:border-orange-400
              focus:ring-2
              focus:ring-orange-500/20
            "
          />
        </div>
      </div>

      {/* Botones */}
      <div className="mt-10 flex justify-end gap-4">
        <button
          type="button"
          className="
            rounded-xl
            border border-white/10
            bg-white/5
            px-6 py-3
            text-white/60
            transition
            hover:border-white/20
            hover:bg-white/10
            hover:text-white
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="
            rounded-xl
            bg-gradient-to-r
            from-orange-500
            to-red-500
            px-8 py-3
            font-semibold
            text-white
            shadow-lg
            shadow-orange-500/20
            transition-all
            hover:scale-105
            hover:shadow-orange-500/30
          "
        >
          Guardar Material
        </button>
      </div>
    </form>
  );
}
