import Image from "next/image";

const projects = [
  {
    title: "Pendones",
    image: "/images/img1.jpg",
  },
  {
    title: "Avisos Luminosos",
    image: "/images/img1.jpg",
  },
  {
    title: "Vinilos",
    image: "/images/img1.jpg",
  },
  {
    title: "Tarjetas",
    image: "/images/img1.jpg",
  },
  {
    title: "Letras 3D",
    image: "/images/img1.jpg",
  },
  {
    title: "Stickers",
    image: "/images/img1.jpg",
  },
  {
    title: "Publicidad",
    image: "/images/img1.jpg",
  },
  {
    title: "Fachadas",
    image: "/images/img1.jpg",
  },
];

export function PortfolioSection() {
  return (
    <section
      className="py-24"
      style={{
        background:
          "linear-gradient(135deg, #F2CB05 0%, #F27507 55%, #F20505 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-16 max-w-2xl">
          <h2 className="text-5xl font-black uppercase leading-none text-black">
            Portafolio
          </h2>

          <p className="mt-6 text-lg leading-8 text-black">
            Descubre algunos de los proyectos de impresión publicitaria,
            señalización y branding realizados para nuestros clientes.
          </p>
        </div>

        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 xl:columns-4">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative mb-6 break-inside-avoid overflow-hidden"
            >
              <Image
                src={project.image}
                alt={project.title}
                width={600}
                height={800}
                className="w-full transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

              <div className="absolute bottom-5 left-5 opacity-0 transition duration-300 group-hover:opacity-100">
                <h3 className="text-xl font-bold text-white">
                  {project.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
