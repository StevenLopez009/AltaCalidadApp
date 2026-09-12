"use client";

import Link from "next/link";
import { useState } from "react";

import Calendar from "./components/Calendar";
import ProductionQueue from "./components/ProductionQueue";
import OrdersOverview from "./components/OrdersOverview";
import PendingOrdersChart from "./components/PendingOrdersChart";
import HeaderCarouselUpload from "./components/HeaderCarouselUpload";
import HeroTitleEditor from "./components/HeroTitleEditor";
import PortfolioUpload from "./components/PortfolioUpload";
import InventoryStatus from "../../../modules/materials/components/InventoryStatus";
import FinanceControl from "../../../modules/finance/components/FinanceControl";
import ProfitControl from "../../../modules/finance/components/ProfitControl";

import { Building2, Package, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  // El día elegido en el calendario alimenta la cola de producción.
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <>
      {/* GRID DECORATIVO */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.035]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative">
          {/* ===================================================== */}
          {/* HEADER / HERO */}
          {/* ===================================================== */}
          <section
            className="
      relative
      mb-6
      overflow-hidden
      rounded-[24px]
      bg-[#171717]
      sm:rounded-[32px]
      lg:h-[400px]
    "
          >
            {/* BLOQUES DE COLOR (solo escritorio: en móvil taparían el título) */}
            <div className="absolute right-0 top-0 hidden h-full w-[35%] bg-gradient-to-br from-[#FFD21C] via-[#FF7A00] to-[#FF3030] lg:block" />

            <div className="absolute right-[22%] top-0 hidden h-full w-[2px] rotate-[12deg] bg-black/20 lg:block" />

            <div className="relative z-10 grid h-full grid-cols-1 lg:grid-cols-[1fr_1.4fr]">
              {/* TEXTO */}
              <div className="flex flex-col justify-between p-6 md:p-10 lg:p-12">
                <div>
                  <div className="mb-6 flex items-center gap-3 lg:mb-8">
                    <span className="h-3 w-3 rounded-full bg-[#FFD21C]" />

                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
                      ALTA CALIDAD / ADMIN
                    </span>
                  </div>

                  <HeroTitleEditor />
                </div>

                <div className="mt-10 flex items-center gap-4">
                  <div className="h-[2px] w-16 bg-[#FF7A00]" />

                  <p className="text-sm text-zinc-400">
                    Centro de control de producción
                  </p>
                </div>
              </div>

              {/* CARRUSEL */}
              <div className="relative h-[260px] min-h-0 overflow-hidden sm:h-[320px] lg:h-full">
                <HeaderCarouselUpload />
              </div>
            </div>
          </section>
          <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* EMPRESAS */}
            <Link
              href="/admin/company"
              className="
              group relative min-h-[190px]
              overflow-hidden rounded-2xl
              bg-[#F7F4ED] p-5 text-[#111] sm:p-7
              transition-all duration-300
              hover:-translate-y-1
            "
            >
              <span className="absolute right-5 top-4 text-xs font-black text-black/30">
                01
              </span>

              <div className="flex h-full flex-col justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111] text-[#FFD21C]">
                  <Building2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                    Gestión
                  </p>

                  <h2 className="text-2xl font-black uppercase tracking-tight lg:text-3xl">
                    Empresas
                  </h2>
                </div>
              </div>
            </Link>

            {/* CATÁLOGO */}
            <Link
              href="/admin/categories"
              className="
              group relative min-h-[190px]
              overflow-hidden rounded-2xl
              bg-[#FFD21C] p-5 text-[#111] sm:p-7
              transition-all duration-300
              hover:-translate-y-1
            "
            >
              <span className="absolute right-5 top-4 text-xs font-black text-black/30">
                02
              </span>

              <div className="flex h-full flex-col justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#111] text-[#FFD21C]">
                  <Package className="h-6 w-6" />
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-black/50">
                    Catálogo
                  </p>

                  <h2 className="text-xl font-black uppercase tracking-tight md:text-2xl lg:text-3xl">
                    Productos
                    <br />& Servicios
                  </h2>
                </div>
              </div>
            </Link>

            {/* CREAR PEDIDO */}
            <Link
              href="/admin/orders"
              className="
              group relative min-h-[190px]
              overflow-hidden rounded-2xl
              bg-gradient-to-br from-[#FF7A00] to-[#FF3030]
              p-5 text-white sm:p-7
              transition-all duration-300
              hover:-translate-y-1
            "
            >
              <span className="absolute right-5 top-4 text-xs font-black text-white/50">
                03
              </span>

              <div className="flex h-full flex-col justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#FF3030]">
                  <ShoppingCart className="h-6 w-6" />
                </div>

                <div>
                  <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                    Operaciones
                  </p>

                  <h2 className="text-2xl font-black uppercase tracking-tight md:text-3xl lg:text-4xl">
                    Nuevo
                    <br />
                    Pedido +
                  </h2>
                </div>
              </div>
            </Link>
          </section>
          {/* ===================================================== */}
          {/* PEDIDOS */}
          {/* ===================================================== */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                  04 / VISIÓN GENERAL
                </span>

                <h2 className="mt-1 text-3xl font-black uppercase tracking-tight">
                  Pedidos
                </h2>
              </div>

              <div className="hidden h-[2px] w-32 bg-gradient-to-r from-[#FFD21C] via-[#FF7A00] to-[#FF3030] md:block" />
            </div>

            <div className="min-h-[420px] overflow-hidden rounded-2xl bg-[#171717] p-5 md:p-7">
              <OrdersOverview />
            </div>
          </section>
          {/* ===================================================== */}
          {/* FINANZAS */}
          {/* ===================================================== */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD21C]">
                  05 / DINERO
                </span>

                <h2 className="mt-1 text-3xl font-black uppercase tracking-tight">
                  Finanzas
                </h2>
              </div>

              <div className="hidden h-[2px] w-32 bg-gradient-to-r from-[#FFD21C] via-[#FF7A00] to-[#FF3030] md:block" />
            </div>

            <div className="overflow-hidden rounded-2xl bg-[#171717] p-5 md:p-7">
              <FinanceControl />
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl bg-[#171717] p-5 md:p-7">
              <ProfitControl />
            </div>
          </section>

          {/* ===================================================== */}
          {/* OPERACIÓN */}
          {/* ===================================================== */}

          <section className="mb-6">
            {/* ENCABEZADO */}
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD21C]">
                  06 / OPERACIÓN
                </span>

                <h2 className="mt-1 text-3xl font-black uppercase tracking-[-0.03em] text-white">
                  Producción
                </h2>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                <span className="h-2 w-2 rounded-full bg-[#FFD21C]" />
                <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
                <span className="h-2 w-2 rounded-full bg-[#FF3030]" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* ===================================================== */}
              {/* CALENDARIO */}
              {/* ===================================================== */}

              <div
                className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-white/[0.07]
        bg-[#171717]
        lg:col-span-7
      "
              >
                {/* Línea superior */}
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#FFD21C] via-[#FF7A00] to-[#FF3030]" />

                <div className="p-5">
                  <Calendar onSelectDate={setSelectedDate} />
                </div>
              </div>

              {/* ===================================================== */}
              {/* COLA DE PRODUCCIÓN */}
              {/* ===================================================== */}

              <div
                className="
        relative
        overflow-hidden
        rounded-[20px]
        border
        border-white/[0.07]
        bg-[#171717]
        lg:col-span-5
      "
              >
                {/* Línea superior */}
                <div className="absolute left-0 top-0 h-1 w-full bg-[#FFD21C]" />

                <div className="p-5">
                  <ProductionQueue selectedDate={selectedDate} />
                </div>
              </div>
            </div>
          </section>

          {/* ===================================================== */}
          {/* INVENTARIO + PENDIENTES */}
          {/* ===================================================== */}
          <section className="mb-6">
            <div className="mb-3">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF3030]">
                07 / CONTROL
              </span>

              <h2 className="mt-1 text-3xl font-black uppercase tracking-tight">
                Estado de operación
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* INVENTARIO */}
              <div className="min-h-[400px] overflow-hidden rounded-2xl bg-[#171717] lg:col-span-8">
                <InventoryStatus />
              </div>

              {/* PENDIENTES */}
              <div className="min-h-[400px] overflow-hidden rounded-2xl bg-[#171717] p-5 text-white lg:col-span-4">
                <PendingOrdersChart />
              </div>
            </div>
          </section>
          {/* ===================================================== */}
          {/* PORTAFOLIO */}
          {/* ===================================================== */}
          <section className="mb-6">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF7A00]">
                  08 / SITIO WEB
                </span>

                <h2 className="mt-1 text-3xl font-black uppercase tracking-tight">
                  Portafolio
                </h2>
              </div>

              <div className="hidden h-[2px] w-32 bg-gradient-to-r from-[#FFD21C] via-[#FF7A00] to-[#FF3030] md:block" />
            </div>

            <div className="overflow-hidden rounded-2xl bg-[#171717] p-5 md:p-7">
              <PortfolioUpload />
            </div>
          </section>

          <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-6 text-xs uppercase tracking-[0.2em] text-zinc-500 md:flex-row md:items-center">
            <span>ALTA CALIDAD</span>

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FFD21C]" />
              <span className="h-2 w-2 rounded-full bg-[#FF7A00]" />
              <span className="h-2 w-2 rounded-full bg-[#FF3030]" />
            </div>

            <span>Creative Production Center</span>
          </div>
      </div>
    </>
  );
}
