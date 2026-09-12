import CompanyForm from "@/src/modules/company/components/CompanyForm";
import CompanyList from "@/src/modules/company/components/CompanyList";

export default function CompaniesPage() {
  return (
    <main>
      <div className="mx-auto w-full max-w-7xl py-6">
        {/* PAGE HEADER */}
        <div className="mb-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-400">
                Administración
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Empresas
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                Gestiona las empresas y configura los descuentos aplicados a sus
                pedidos.
              </p>
            </div>

            <div
              className="
                w-fit
                rounded-full
                border
                border-orange-500/20
                bg-orange-500/10
                px-3
                py-1.5
                text-xs
                font-medium
                text-orange-300
              "
            >
              Gestión comercial
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div
          className="
            grid
            grid-cols-1
            items-stretch
            gap-5
            lg:grid-cols-[340px_1fr]
          "
        >
          {/* CREATE COMPANY */}
          <CompanyForm />

          {/* COMPANY LIST */}
          <CompanyList />
        </div>
      </div>
    </main>
  );
}
