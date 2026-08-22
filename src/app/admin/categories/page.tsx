import { CategoryForm } from "@/src/modules/admin/components/CategoryForm";
import { ServiceForm } from "@/src/modules/services/components/ServiceForm";
import MaterialForm from "../materials/components/MaterialForm";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#0B0914] p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Crear Categoría</h1>

      <CategoryForm />
      <ServiceForm />
      <MaterialForm />
    </div>
  );
}
