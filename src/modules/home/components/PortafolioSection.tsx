import Image from "next/image";

import { getPortfolioImages } from "../repositories/portfolio.repositories";

// Respaldo por si aún no se ha subido ninguna imagen desde el panel.
const fallbackProjects = [
  { id: 0, image_url: "/images/img1.jpg", title: "Trabajos realizados" },
];

export async function PortfolioSection() {
  const stored = await getPortfolioImages();

  const projects = stored.length > 0 ? stored : fallbackProjects;

  return (
    <section
      className="py-16 sm:py-24"
      style={{
        background:
          "linear-gradient(135deg, #F2CB05 0%, #F27507 55%, #F20505 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10 max-w-2xl sm:mb-16">
          <h2 className="text-4xl font-black uppercase leading-none text-black sm:text-5xl">
            Portafolio
          </h2>

          <p className="mt-5 text-base leading-7 text-black sm:mt-6 sm:text-lg sm:leading-8">
            Descubre algunos de los proyectos de impresión publicitaria,
            señalización y branding realizados para nuestros clientes.
          </p>
        </div>

        <div className="columns-2 gap-4 sm:gap-6 lg:columns-3 xl:columns-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group relative mb-4 break-inside-avoid overflow-hidden rounded-lg sm:mb-6"
            >
              <Image
                src={project.image_url}
                alt={project.title ?? "Trabajo realizado"}
                width={600}
                height={800}
                className="w-full transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

              {project.title && (
                <div className="absolute bottom-5 left-5 opacity-0 transition duration-300 group-hover:opacity-100">
                  <h3 className="text-xl font-bold text-white">
                    {project.title}
                  </h3>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
