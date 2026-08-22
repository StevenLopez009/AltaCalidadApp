import { notFound } from "next/navigation";
import { listServicesByCategory } from "@/src/modules/services/services/services.service";
import { ServicesGrid } from "@/src/modules/services/components/ServicesGrid";
import { findCategoryBySlug } from "@/src/modules/categories/services/categories.service";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const services = await listServicesByCategory(category.id);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="mx-auto max-w-7xl px-8 py-20">
        <h2 className="text-4xl font-black uppercase">Servicios disponibles</h2>
        <ServicesGrid services={services} />
        {services.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center">
            <h3 className="text-2xl font-bold">No hay servicios disponibles</h3>

            <p className="mt-3 text-white/60">
              Próximamente agregaremos nuevos servicios para esta categoría.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
