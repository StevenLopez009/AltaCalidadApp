import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#0B0914] p-8 text-white">
      <div className="grid grid-cols-12 gap-6 auto-rows-[170px]">
        {/* Sidebar */}
        <aside className="col-span-2 row-span-4 rounded-3xl bg-[#161325] border border-purple-500/20 p-6">
          Sidebar
        </aside>

        {/* Header */}
        <header className="col-span-10 rounded-3xl  p-6">Header</header>

        {/* Cards */}
        <Link
          href="/admin/categories"
          className="col-span-2 rounded-3xl bg-gradient-to-br from-purple-600/40 to-[#1D1734] border border-purple-500/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.4)] cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-white">Categorías</h2>
        </Link>

        <Link
          href="/admin/services"
          className="col-span-2 rounded-3xl bg-gradient-to-br from-purple-600/40 to-[#1D1734] border border-purple-500/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.4)] cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-white">Servicios</h2>
        </Link>

        <div className="col-span-2 rounded-3xl bg-gradient-to-br from-purple-600/40 to-[#1D1734] border border-purple-500/20 p-6">
          Portafolio
        </div>

        <Link
          href="/admin/materials"
          className="col-span-4 rounded-3xl bg-gradient-to-br from-purple-600/40 to-[#1D1734] border border-purple-500/20 p-6 transition-all duration-300 hover:scale-105 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,.4)] cursor-pointer"
        >
          <h2 className="text-xl font-semibold text-white">
            Actualizar inventario
          </h2>
        </Link>

        {/* Graph */}
        <div className="col-span-6 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6">
          Calendario
        </div>

        {/* Requests */}
        <div className="col-span-4 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6">
          Cola Produccion
        </div>

        {/* Map */}
        <div className="col-span-8 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6">
          Pedidos
        </div>

        {/* Circle Chart */}
        <div className="col-span-4 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6">
          Pendientes
        </div>

        {/* Cube */}
        <div className="col-span-4 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6 flex items-center justify-center">
          Inventario
        </div>
        <div className="col-span-4 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6 flex items-center justify-center">
          Ventas
        </div>
        <div className="col-span-4 row-span-2 rounded-3xl bg-[#161325] border border-purple-500/20 p-6 flex items-center justify-center">
          Mas vendidos
        </div>
      </div>
    </div>
  );
}
