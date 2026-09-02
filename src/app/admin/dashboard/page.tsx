"use client";

import Link from "next/link";

import Calendar from "./components/Calendar";
import ProductionQueue from "./components/ProductionQueue";
import OrdersOverview from "./components/OrdersOverview";
import PendingOrdersChart from "./components/PendingOrdersChart";
import HeaderCarouselUpload from "./components/HeaderCarouselUpload";
import InventoryStatus from "../../../modules/materials/components/InventoryStatus";
import AdminSidebar from "./components/AdminSidebar";

import { Building2, Package, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0c] p-5 text-white md:p-8">
      {/* Fondo ambiental difuminado para dar profundidad (con tonos naranja) */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-[10%] h-[500px] w-[500px] rounded-full bg-orange-900/10 blur-[160px]" />
        <div className="absolute top-[30%] -right-20 h-[450px] w-[450px] rounded-full bg-amber-900/10 blur-[160px]" />
      </div>

      <div className="relative grid grid-cols-12 auto-rows-[150px] gap-5">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Header */}
        <header className="col-span-10 row-span-2 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121215]/90 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <HeaderCarouselUpload />
        </header>

        {/* Empresas (con acento naranja) */}
        <Link
          href="/admin/company"
          className="
            group relative col-span-2 overflow-hidden rounded-[24px]
            border border-white/[0.08]
            bg-gradient-to-b from-[#16161a] to-[#0e0e11]
            p-5
            shadow-[0_10px_30px_rgba(0,0,0,0.5)]
            transition-all duration-300
            hover:-translate-y-1.5
            hover:border-orange-500/40
            hover:shadow-[0_0_40px_rgba(251,146,60,0.15)]
          "
        >
          <div className="absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-orange-500/10 blur-[60px] transition-all duration-500 group-hover:scale-125 group-hover:bg-orange-500/20" />
          <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-zinc-600 transition-colors group-hover:bg-orange-400 group-hover:shadow-[0_0_10px_rgba(251,146,60,0.8)]" />

          <div className="relative flex h-full flex-col">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-300 shadow-inner transition-all group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:text-orange-300">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="mt-auto">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Gestión
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Empresas
              </h2>
            </div>
          </div>
        </Link>

        {/* Productos y servicios (con acento naranja) */}
        <Link
          href="/admin/categories"
          className="
            group relative col-span-4 overflow-hidden rounded-[24px]
            border border-white/[0.08]
            bg-gradient-to-b from-[#16161a] to-[#0e0e11]
            p-5
            shadow-[0_10px_30px_rgba(0,0,0,0.5)]
            transition-all duration-300
            hover:-translate-y-1.5
            hover:border-orange-500/40
            hover:shadow-[0_0_40px_rgba(251,146,60,0.15)]
          "
        >
          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-orange-500/15 blur-[70px] transition-all duration-500 group-hover:scale-125 group-hover:bg-orange-500/25" />
          <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-zinc-600 transition-colors group-hover:bg-orange-400 group-hover:shadow-[0_0_10px_rgba(251,146,60,0.8)]" />

          <div className="relative flex h-full flex-col">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-zinc-300 shadow-inner transition-all group-hover:border-orange-500/30 group-hover:bg-orange-500/10 group-hover:text-orange-300">
              <Package className="h-5 w-5" />
            </div>

            <div className="mt-auto">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                Catálogo
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Productos y servicios
              </h2>
            </div>
          </div>
        </Link>

        {/* Crear pedido (Destacado con acento naranja intenso) */}
        <Link
          href="/admin/orders"
          className="
            group relative col-span-4 overflow-hidden rounded-[24px]
            border border-orange-500/30
            bg-gradient-to-br from-[#1f1614] via-[#161212] to-[#0e0e11]
            p-5
            shadow-[0_15px_40px_rgba(0,0,0,0.5)]
            transition-all duration-300
            hover:-translate-y-1.5
            hover:border-orange-400/70
            hover:shadow-[0_0_50px_rgba(251,146,60,0.25)]
          "
        >
          <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-orange-500/25 blur-[80px] transition-all duration-500 group-hover:scale-125 group-hover:bg-orange-500/35" />
          <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,1)]" />

          <div className="relative flex h-full flex-col">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-[0_0_20px_rgba(251,146,60,0.2)] transition-all group-hover:bg-orange-500/25">
              <ShoppingCart className="h-5 w-5" />
            </div>

            <div className="mt-auto">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-orange-400/80">
                Operaciones
              </p>
              <h2 className="text-lg font-semibold tracking-tight text-white">
                Crear Pedido
              </h2>
            </div>
          </div>
        </Link>

        {/* Calendario */}
        <div className="col-span-6 row-span-2 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121215] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <Calendar />
        </div>

        {/* Cola de producción */}
        <div className="col-span-4 row-span-2 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121215] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <ProductionQueue />
        </div>

        {/* Resumen de pedidos */}
        <div className="col-span-12 row-span-3 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121215] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <OrdersOverview />
        </div>

        {/* Pendientes */}
        <div className="col-span-4 row-span-2 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121215] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <PendingOrdersChart />
        </div>

        {/* Inventario */}
        <div className="col-span-8 row-span-3 min-h-0 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#121215] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
          <InventoryStatus />
        </div>
      </div>
    </div>
  );
}
