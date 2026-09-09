import { notFound } from "next/navigation";

import { listServicesByCategory } from "@/src/modules/services/services/services.service";
import { findCategoryBySlug } from "@/src/modules/categories/services/categories.service";
import { CategoryServices } from "@/src/modules/services/components/CategoryServices";

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
      <CategoryServices category={category} services={services} />
    </main>
  );
}
