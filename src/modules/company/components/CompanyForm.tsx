"use client";

import { useState } from "react";

export default function CompanyForm() {
  const [form, setForm] = useState({
    nameCompany: "",
    discountPercentage: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await fetch("/api/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameCompany: form.nameCompany,
          discountPercentage: Number(form.discountPercentage),
        }),
      });

      if (!response.ok) {
        throw new Error("No fue posible crear la empresa");
      }

      alert("Empresa creada correctamente");

      setForm({
        nameCompany: "",
        discountPercentage: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-purple-500/20 bg-[#161325] p-8 shadow-xl"
    >
      <h2 className="mb-8 text-3xl font-bold text-white">Nueva Empresa</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Nombre de la empresa
          </label>

          <input
            name="nameCompany"
            value={form.nameCompany}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-300">
            Descuento (%)
          </label>

          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            name="discountPercentage"
            value={form.discountPercentage}
            onChange={handleChange}
            className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white"
            required
          />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-3 font-semibold text-white transition hover:scale-105"
        >
          Guardar Empresa
        </button>
      </div>
    </form>
  );
}
