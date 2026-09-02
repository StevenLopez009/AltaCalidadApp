"use client";

import { useEffect, useState } from "react";

import { Building2, Percent, Phone } from "lucide-react";

interface Company {
  id: number;
  name_company: string;
  telefono: string;
  discount_percentage: number;
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const response = await fetch("/api/company");
      const data = await response.json();

      if (Array.isArray(data)) {
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
  }

  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        border border-white/[0.07]
        bg-[#121215]
        shadow-[0_15px_40px_rgba(0,0,0,0.35)]
      "
    >
      {/* HEADER */}
      <div
        className="
          flex items-center justify-between
          border-b border-white/[0.06]
          bg-gradient-to-r from-orange-500/[0.06] via-transparent to-transparent
          px-5 py-5
          sm:px-7
        "
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
            <Building2 className="h-5 w-5 text-orange-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Empresas
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500">Empresas registradas</p>
          </div>
        </div>

        <div className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
          {companies.length}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-7 py-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Empresa
              </th>

              <th className="px-7 py-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Teléfono
              </th>

              <th className="px-7 py-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Descuento
              </th>
            </tr>
          </thead>

          <tbody>
            {companies.map((company) => (
              <tr
                key={company.id}
                className="
                  border-b border-white/[0.04]
                  transition-colors
                  hover:bg-orange-500/[0.035]
                "
              >
                {/* EMPRESA */}
                <td className="px-7 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04]">
                      <Building2 className="h-4 w-4 text-zinc-500" />
                    </div>

                    <span className="text-sm font-medium text-zinc-200">
                      {company.name_company}
                    </span>
                  </div>
                </td>

                {/* TELEFONO */}
                <td className="px-7 py-4">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-orange-400" />

                    <span className="text-sm text-zinc-300">
                      {company.telefono}
                    </span>
                  </div>
                </td>

                {/* DESCUENTO */}
                <td className="px-7 py-4">
                  <span
                    className="
                      inline-flex items-center gap-1.5
                      rounded-full
                      border border-yellow-500/20
                      bg-yellow-500/10
                      px-3 py-1
                      text-xs font-semibold
                      text-yellow-400
                    "
                  >
                    <Percent className="h-3 w-3" />
                    {company.discount_percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="space-y-3 p-4 md:hidden">
        {companies.map((company) => (
          <div
            key={company.id}
            className="
              rounded-xl
              border border-white/[0.06]
              bg-white/[0.025]
              p-4
              transition-all
              hover:border-orange-500/20
              hover:bg-orange-500/[0.04]
            "
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10">
                  <Building2 className="h-4 w-4 text-orange-400" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {company.name_company}
                  </p>

                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    Empresa #{company.id}
                  </p>
                </div>
              </div>

              <span
                className="
                  shrink-0
                  rounded-full
                  border border-yellow-500/20
                  bg-yellow-500/10
                  px-2.5 py-1
                  text-xs font-semibold
                  text-yellow-400
                "
              >
                {company.discount_percentage}%
              </span>
            </div>

            {/* TELEFONO MOBILE */}
            <div className="mt-4 flex items-center gap-2 border-t border-white/[0.05] pt-3">
              <Phone className="h-3.5 w-3.5 text-orange-400" />

              <span className="text-xs text-zinc-400">{company.telefono}</span>
            </div>
          </div>
        ))}

        {companies.length === 0 && (
          <div className="py-10 text-center">
            <Building2 className="mx-auto h-8 w-8 text-zinc-700" />

            <p className="mt-3 text-sm text-zinc-500">
              No hay empresas registradas
            </p>
          </div>
        )}
      </div>

      {/* EMPTY DESKTOP */}
      {companies.length === 0 && (
        <div className="hidden py-14 text-center md:block">
          <Building2 className="mx-auto h-9 w-9 text-zinc-700" />

          <p className="mt-3 text-sm text-zinc-500">
            No hay empresas registradas
          </p>
        </div>
      )}
    </section>
  );
}
