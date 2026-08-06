import { Service } from "@/src/types/service";
import { ServiceCard } from "./ServiceCard";

interface Props {
  services: Service[];
}

export function ServicesGrid({ services }: Props) {
  if (services.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 py-20 text-center">
        <h3 className="text-2xl font-bold">No hay servicios disponibles</h3>

        <p className="mt-3 text-white/60">
          Próximamente agregaremos nuevos servicios.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-14 grid items-start gap-8 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
