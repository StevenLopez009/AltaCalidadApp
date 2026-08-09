import { Service } from "@/src/shared/types/service";
import { ServiceCard } from "./ServiceCard";

interface Props {
  services: Service[];
}

export function ServicesGrid({ services }: Props) {
  return (
    <div className="mt-14 grid items-start gap-8 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
