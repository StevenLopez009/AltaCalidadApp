import { CategoryForm } from "@/src/modules/admin/components/CategoryForm";
import { ServiceForm } from "@/src/modules/services/components/ServiceForm";
import MaterialForm from "../materials/components/MaterialForm";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-[#0B0914] px-6 py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1600px] flex-col">
        {/* Header */}
        <div className="mb-5 shrink-0">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-purple-400">
            Administración
          </p>

          <div className="mt-1 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Catálogo
              </h1>

              <p className="mt-1 text-sm text-white/40">
                Gestiona categorías, servicios y materiales.
              </p>
            </div>
          </div>
        </div>

        {/* Formularios */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Categoría */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl">
            <div className="shrink-0 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-sm font-bold text-orange-400">
                  01
                </div>

                <div>
                  <h2 className="font-bold text-white">Categoría</h2>

                  <p className="text-xs text-white/40">Nueva categoría</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-5">
              <CategoryForm />
            </div>
          </section>

          {/* Servicio */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl">
            <div className="shrink-0 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-sm font-bold text-purple-400">
                  02
                </div>

                <div>
                  <h2 className="font-bold text-white">Servicio</h2>

                  <p className="text-xs text-white/40">Nuevo servicio</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-5">
              <ServiceForm />
            </div>
          </section>

          {/* Material */}
          <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl">
            <div className="shrink-0 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-fuchsia-500/10 text-sm font-bold text-fuchsia-400">
                  03
                </div>

                <div>
                  <h2 className="font-bold text-white">Material</h2>

                  <p className="text-xs text-white/40">Nuevo material</p>
                </div>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden p-5">
              <MaterialForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
