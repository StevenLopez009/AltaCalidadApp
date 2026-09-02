"use client";

import { useState } from "react";

import { Building2, Percent, Phone, Save } from "lucide-react";

export default function CompanyForm() {
  const [form, setForm] = useState({
    nameCompany: "",
    telefono: "",
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
          telefono: form.telefono,
          discountPercentage: Number(form.discountPercentage),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No fue posible crear la empresa");
      }

      alert("Empresa creada correctamente");

      setForm({
        nameCompany: "",
        telefono: "",
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
      className="
        overflow-hidden
        rounded-2xl
        border border-white/[0.07]
        bg-[#121215]
        shadow-[0_15px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* HEADER */}
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-orange-500/[0.07] via-transparent to-transparent px-5 py-5 sm:px-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
            <Building2 className="h-5 w-5 text-orange-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Nueva empresa
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500">
              Registra una empresa, teléfono y configura su descuento.
            </p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <div className="p-5 sm:p-7">
        <div className="grid gap-5 md:grid-cols-2">
          {/* COMPANY */}
          <div>
            <label
              htmlFor="nameCompany"
              className="mb-2 block text-xs font-medium text-zinc-400"
            >
              Nombre de la empresa
            </label>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

              <input
                id="nameCompany"
                name="nameCompany"
                value={form.nameCompany}
                onChange={handleChange}
                placeholder="Ej. Empresa ABC"
                className="
                  w-full rounded-xl
                  border border-white/[0.08]
                  bg-[#0B0914]
                  py-3 pl-10 pr-4
                  text-sm text-white
                  outline-none
                  placeholder:text-zinc-700
                  transition-all
                  focus:border-orange-500/50
                  focus:bg-orange-500/[0.02]
                  focus:ring-2
                  focus:ring-orange-500/10
                "
                required
              />
            </div>
          </div>

          {/* TELEFONO */}
          <div>
            <label
              htmlFor="telefono"
              className="mb-2 block text-xs font-medium text-zinc-400"
            >
              Teléfono
            </label>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

              <input
                id="telefono"
                name="telefono"
                type="tel"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Ej. 3001234567"
                maxLength={20}
                className="
                  w-full rounded-xl
                  border border-white/[0.08]
                  bg-[#0B0914]
                  py-3 pl-10 pr-4
                  text-sm text-white
                  outline-none
                  placeholder:text-zinc-700
                  transition-all
                  focus:border-orange-500/50
                  focus:bg-orange-500/[0.02]
                  focus:ring-2
                  focus:ring-orange-500/10
                "
                required
              />
            </div>
          </div>

          {/* DISCOUNT */}
          <div className="md:col-span-2">
            <label
              htmlFor="discountPercentage"
              className="mb-2 block text-xs font-medium text-zinc-400"
            >
              Descuento
            </label>

            <div className="relative">
              <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />

              <input
                id="discountPercentage"
                type="number"
                min={0}
                max={100}
                step="0.01"
                name="discountPercentage"
                value={form.discountPercentage}
                onChange={handleChange}
                placeholder="0"
                className="
                  w-full rounded-xl
                  border border-white/[0.08]
                  bg-[#0B0914]
                  py-3 pl-10 pr-12
                  text-sm text-white
                  outline-none
                  placeholder:text-zinc-700
                  transition-all
                  focus:border-yellow-500/50
                  focus:bg-yellow-500/[0.02]
                  focus:ring-2
                  focus:ring-yellow-500/10
                "
                required
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-yellow-500">
                %
              </span>
            </div>
          </div>
        </div>

        {/* ACTION */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="
              flex w-full items-center justify-center gap-2
              rounded-xl
              border border-orange-400/20
              bg-gradient-to-r from-orange-600 to-red-600
              px-6 py-3
              text-sm font-semibold text-white
              shadow-[0_8px_25px_rgba(249,115,22,0.15)]
              transition-all duration-300
              hover:-translate-y-0.5
              hover:shadow-[0_10px_30px_rgba(249,115,22,0.25)]
              active:translate-y-0
              sm:w-auto
            "
          >
            <Save className="h-4 w-4" />
            Guardar empresa
          </button>
        </div>
      </div>
    </form>
  );
}
