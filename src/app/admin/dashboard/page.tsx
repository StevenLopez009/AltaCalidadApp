"use client";
import Link from "next/link";
import Calendar from "./components/Calendar";
import ProductionQueue from "./components/ProductionQueue";
import OrdersOverview from "./components/OrdersOverview";
import PendingOrdersChart from "./components/PendingOrdersChart";
import HeaderCarouselUpload from "./components/HeaderCarouselUpload";
import InventoryStatus from "../../../modules/materials/components/InventoryStatus";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0B0914] p-8 text-white">
      <div className="grid grid-cols-12 auto-rows-[170px] gap-6">
        {/* Sidebar */}
        <aside className="col-span-2 row-span-4 rounded-3xl border border-purple-500/20 bg-[#161325] p-6">
          Sidebar
        </aside>

        {/* Header */}
        <header className="col-span-10 row-span-2 overflow-hidden ">
          <HeaderCarouselUpload />
        </header>

        {/* Empresas */}
        <Link
          href="/admin/company"
          className="col-span-2 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/40 to-[#1D1734] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.4)]"
        >
          <h2 className="text-xl font-semibold text-white">Empresas</h2>
        </Link>

        {/* Productos y servicios */}
        <Link
          href="/admin/categories"
          className="col-span-4 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/40 to-[#1D1734] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.4)]"
        >
          <h2 className="text-xl font-semibold text-white">
            Productos y servicios
          </h2>
        </Link>

        {/* Crear pedido */}
        <Link
          href="/admin/orders"
          className="col-span-4 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-600/40 to-[#1D1734] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.4)]"
        >
          <h2 className="text-xl font-semibold text-white">Crear Pedido</h2>
        </Link>

        {/* Calendario */}
        <div className="col-span-6 row-span-2 overflow-hidden rounded-3xl border border-purple-500/20 bg-[#161325] p-6">
          <Calendar />
        </div>

        {/* Cola de producción */}
        <div className="col-span-4 row-span-2 overflow-hidden rounded-3xl border border-purple-500/20 bg-[#161325] p-6">
          <ProductionQueue />
        </div>

        {/* Resumen de pedidos */}
        <div className="col-span-12 row-span-3 overflow-hidden rounded-3xl border border-purple-500/20 bg-[#161325] p-6">
          <OrdersOverview />
        </div>

        {/* Pendientes */}
        <div className="col-span-4 row-span-2 overflow-hidden rounded-3xl border border-purple-500/20 bg-[#161325] p-6">
          <PendingOrdersChart />
        </div>

        {/* Inventario */}
        <div className="col-span-8 row-span-2 min-h-0 overflow-hidden rounded-3xl border border-purple-500/20 bg-[#161325]">
          <InventoryStatus />
        </div>
      </div>
    </div>
  );
}
