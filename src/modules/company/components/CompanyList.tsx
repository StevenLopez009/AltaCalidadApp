"use client";

import { useEffect, useState } from "react";
import { Building2, Percent, Phone, Trash2, Users } from "lucide-react";

interface Company {
  id: number;
  name_company: string;
  telefono: string;
  discount_percentage: number;
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const response = await fetch("/api/company");

      if (!response.ok) {
        throw new Error("Error cargando empresas");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        setCompanies(data);
      }
    } catch (error) {
      console.error("Error cargando empresas:", error);
    }
  }

  async function handleDelete(company: Company) {
    const confirmed = window.confirm(
      `¿Estás seguro de eliminar la empresa "${company.name_company}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(company.id);

      const response = await fetch("/api/company", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: company.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar la empresa");
      }

      setCompanies((currentCompanies) =>
        currentCompanies.filter((item) => item.id !== company.id),
      );
    } catch (error) {
      console.error("Error eliminando empresa:", error);

      window.alert(
        error instanceof Error ? error.message : "Error eliminando empresa",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section
      className="
        flex
        h-full
        flex-col
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
          flex
          items-center
          justify-between
          border-b border-white/[0.06]
          bg-gradient-to-r
          from-orange-500/[0.07]
          via-transparent
          to-transparent
          px-5
          py-5
        "
      >
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-orange-500/20
              bg-orange-500/10
            "
          >
            <Building2 className="h-5 w-5 text-orange-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">Empresas</h2>

            <p className="text-xs text-zinc-500">Empresas registradas</p>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-orange-500/20
            bg-orange-500/10
            px-3
            py-1.5
            text-xs
            font-semibold
            text-orange-300
          "
        >
          <Users className="h-3.5 w-3.5" />
          {companies.length}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-4 sm:p-5">
        {companies.length === 0 ? (
          <div
            className="
              flex
              min-h-[300px]
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-white/[0.08]
              bg-white/[0.015]
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.03]
              "
            >
              <Building2 className="h-6 w-6 text-zinc-700" />
            </div>

            <p className="mt-3 text-sm font-medium text-zinc-500">
              No hay empresas registradas
            </p>

            <p className="mt-1 text-xs text-zinc-700">
              Las empresas aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {companies.map((company) => (
              <div
                key={company.id}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  p-4
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-orange-500/20
                  hover:bg-orange-500/[0.035]
                  hover:shadow-[0_8px_25px_rgba(0,0,0,0.2)]
                "
              >
                {/* TOP */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-orange-500/10
                        bg-orange-500/[0.08]
                      "
                    >
                      <Building2 className="h-4 w-4 text-orange-400" />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-zinc-200
                        "
                      >
                        {company.name_company}
                      </p>

                      <p className="mt-0.5 text-[10px] text-zinc-600">
                        Empresa #{company.id}
                      </p>
                    </div>
                  </div>

                  {/* DELETE */}
                  <button
                    type="button"
                    onClick={() => handleDelete(company)}
                    disabled={deletingId === company.id}
                    title="Eliminar empresa"
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      border
                      border-red-500/10
                      bg-red-500/[0.06]
                      text-red-400/70
                      opacity-70
                      transition-all
                      hover:border-red-500/30
                      hover:bg-red-500/10
                      hover:text-red-400
                      hover:opacity-100
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* DIVIDER */}
                <div className="my-3 border-t border-white/[0.05]" />

                {/* INFO */}
                <div className="flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-2">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-600" />

                    <span className="truncate text-xs text-zinc-400">
                      {company.telefono}
                    </span>
                  </div>

                  <div
                    className="
                      ml-3
                      flex
                      shrink-0
                      items-center
                      gap-1
                      rounded-full
                      border
                      border-yellow-500/15
                      bg-yellow-500/[0.08]
                      px-2
                      py-1
                      text-[11px]
                      font-semibold
                      text-yellow-400
                    "
                  >
                    <Percent className="h-3 w-3" />
                    {company.discount_percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
