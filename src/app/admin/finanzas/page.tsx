"use client";

import FinanceControl from "@/src/modules/finance/components/FinanceControl";
import ProfitControl from "@/src/modules/finance/components/ProfitControl";

export default function FinanzasPage() {
  return (
    <main className="py-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.8)]" />

            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-orange-400">
              Administración
            </p>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Finanzas
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
            Reporte de ingresos y ganancias del negocio.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-[#171717] p-5 md:p-7">
          <FinanceControl />
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl bg-[#171717] p-5 md:p-7">
          <ProfitControl />
        </div>
      </div>
    </main>
  );
}
