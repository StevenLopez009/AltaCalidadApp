import { CategoryForm } from "@/src/components/admin/categories/CategoryForm";
import { ServiceForm } from "@/src/components/admin/services/ServiceForm";

export default function AdminDashboard() {
  return (
    <main
      className="
      min-h-screen
      bg-zinc-950
      p-10
      text-white
    "
    >
      <h1
        className="
        text-5xl
        font-black
        uppercase
      "
      >
        Panel de Administración
      </h1>

      <p className="mt-4 text-white/60">Gestiona categorías y servicios.</p>

      <section className="mt-12">
        <CategoryForm />
      </section>
      <div>
        <ServiceForm />
      </div>
    </main>
  );
}
