import { notFound } from "next/navigation";
import { listServicesByCategory } from "@/src/modules/services/services/services.service";
import Image from "next/image";
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
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-transparent to-red-600/20" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-8 py-24 md:flex-row">
          <div className="flex-1">
            <span className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-400">
              Categoría
            </span>

            <h1 className="mt-4 text-5xl font-black uppercase leading-none md:text-7xl">
              {category.name}
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/70">
              {category.description}
            </p>
          </div>

          <div className="relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 md:w-[450px]">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

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
