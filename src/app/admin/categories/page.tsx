"use client";

import { useState } from "react";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  Layers3,
  Package,
  Plus,
  Sparkles,
} from "lucide-react";

import { CategoryForm } from "@/src/modules/admin/components/CategoryForm";
import { ServiceForm } from "@/src/modules/services/components/ServiceForm";
import MaterialForm from "../materials/components/MaterialForm";
import MaterialsManager from "@/src/modules/materials/components/MaterialsManager";
import ServicesManager from "@/src/modules/services/components/ServicesManager";

type FormType = "category" | "service" | "material" | null;

export default function CategoriesPage() {
  const [openForm, setOpenForm] = useState<FormType>(null);

  function toggleForm(form: FormType) {
    setOpenForm((current) => (current === form ? null : form));
  }

  return (
    <main className="py-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.8)]" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
                  Administración
                </p>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Catálogo
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
                Gestiona categorías, servicios y materiales desde un solo lugar.
              </p>
            </div>

            <div
              className="
                flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-orange-500/15
                bg-orange-500/[0.06]
                px-3
                py-1.5
                text-xs
                font-medium
                text-orange-300
              "
            >
              <Sparkles className="h-3.5 w-3.5" />
              Gestión de catálogo
            </div>
          </div>
        </header>

        {/* FORMS */}
        <div className="space-y-3">
          {/* CATEGORY */}
          <section
            className={`
              overflow-hidden
              rounded-2xl
              border
              transition-all
              duration-300
              ${
                openForm === "category"
                  ? "border-orange-500/30 bg-[#121215] shadow-[0_15px_45px_rgba(249,115,22,0.08)]"
                  : "border-white/[0.07] bg-[#121215] hover:border-orange-500/20"
              }
            `}
          >
            <button
              type="button"
              onClick={() => toggleForm("category")}
              className="group flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-orange-500/20
                    bg-orange-500/10
                    text-orange-400
                    transition
                    group-hover:bg-orange-500/15
                  "
                >
                  <Layers3 className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden text-[10px] font-bold tracking-widest text-zinc-700 sm:block">
                    01
                  </span>

                  <div>
                    <h2 className="font-semibold text-white">Categoría</h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Crear y administrar categorías
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  transition-all
                  ${
                    openForm === "category"
                      ? "rotate-45 border-orange-500/20 bg-orange-500/10 text-orange-400"
                      : "border-white/[0.06] bg-white/[0.025] text-zinc-500 group-hover:border-orange-500/20 group-hover:text-orange-400"
                  }
                `}
              >
                <Plus className="h-4 w-4" />
              </div>
            </button>

            {/* FORM */}
            <div
              className={`
                grid
                transition-all
                duration-300
                ${
                  openForm === "category"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-white/[0.06] p-4 sm:p-6">
                  <CategoryForm />
                </div>
              </div>
            </div>
          </section>

          {/* MATERIAL */}
          <section
            className={`
              overflow-hidden
              rounded-2xl
              border
              transition-all
              duration-300
              ${
                openForm === "material"
                  ? "border-fuchsia-500/30 bg-[#121215] shadow-[0_15px_45px_rgba(217,70,239,0.08)]"
                  : "border-white/[0.07] bg-[#121215] hover:border-fuchsia-500/20"
              }
            `}
          >
            <button
              type="button"
              onClick={() => toggleForm("material")}
              className="group flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-fuchsia-500/20
                    bg-fuchsia-500/10
                    text-fuchsia-400
                    transition
                    group-hover:bg-fuchsia-500/15
                  "
                >
                  <Boxes className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden text-[10px] font-bold tracking-widest text-zinc-700 sm:block">
                    02
                  </span>

                  <div>
                    <h2 className="font-semibold text-white">Material</h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Registrar material e inventario
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  transition-all
                  ${
                    openForm === "material"
                      ? "rotate-45 border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400"
                      : "border-white/[0.06] bg-white/[0.025] text-zinc-500 group-hover:border-fuchsia-500/20 group-hover:text-fuchsia-400"
                  }
                `}
              >
                <Plus className="h-4 w-4" />
              </div>
            </button>

            {/* FORM */}
            <div
              className={`
                grid
                transition-all
                duration-300
                ${
                  openForm === "material"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-white/[0.06] p-4 sm:p-6">
                  <MaterialForm />
                </div>
              </div>
            </div>
          </section>

          {/* SERVICE */}
          <section
            className={`
              overflow-hidden
              rounded-2xl
              border
              transition-all
              duration-300
              ${
                openForm === "service"
                  ? "border-purple-500/30 bg-[#121215] shadow-[0_15px_45px_rgba(168,85,247,0.08)]"
                  : "border-white/[0.07] bg-[#121215] hover:border-purple-500/20"
              }
            `}
          >
            <button
              type="button"
              onClick={() => toggleForm("service")}
              className="group flex w-full items-center justify-between px-5 py-4 text-left sm:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-purple-500/20
                    bg-purple-500/10
                    text-purple-400
                    transition
                    group-hover:bg-purple-500/15
                  "
                >
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden text-[10px] font-bold tracking-widest text-zinc-700 sm:block">
                    03
                  </span>

                  <div>
                    <h2 className="font-semibold text-white">Servicio</h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Crear un nuevo servicio
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border
                  transition-all
                  ${
                    openForm === "service"
                      ? "rotate-45 border-purple-500/20 bg-purple-500/10 text-purple-400"
                      : "border-white/[0.06] bg-white/[0.025] text-zinc-500 group-hover:border-purple-500/20 group-hover:text-purple-400"
                  }
                `}
              >
                <Plus className="h-4 w-4" />
              </div>
            </button>

            {/* FORM */}
            <div
              className={`
                grid
                transition-all
                duration-300
                ${
                  openForm === "service"
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-white/[0.06] p-4 sm:p-6">
                  <ServiceForm />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ================= LISTADOS ================= */}

        <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
              <Boxes className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Materiales registrados
              </h2>

              <p className="text-[11px] text-zinc-500">
                Edita el inventario o elimina materiales sin uso
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <MaterialsManager />
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
          <div className="flex items-center gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
              <ClipboardList className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                Servicios registrados
              </h2>

              <p className="text-[11px] text-zinc-500">
                Ajusta precios y unidades o elimina servicios sin pedidos
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <ServicesManager />
          </div>
        </section>

        {/* FOOTER INFO */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-zinc-700">
          <Package className="h-3.5 w-3.5" />
          Selecciona una sección para comenzar
          <ChevronDown className="h-3 w-3" />
        </div>
      </div>
    </main>
  );
}
