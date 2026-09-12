import {
  Palette,
  Printer,
  Megaphone,
  ShoppingBag,
  Globe,
  Camera,
  Package,
} from "lucide-react";

import Link from "next/link";
import { listCategories } from "../../categories/services/categories.service";
import Image from "next/image";

const icons = [Palette, Printer, Megaphone, ShoppingBag, Globe, Camera];

// Alturas alternadas para el mosaico de movil: sin ellas las dos columnas
// quedan parejas y se pierde el efecto escalonado.
const MOBILE_RATIOS = [
  "aspect-[3/4]",
  "aspect-[1/1]",
  "aspect-[4/5]",
  "aspect-[5/7]",
];

export async function ServicesSection() {
  const categories = await listCategories();
  return (
    <section className="relative z-20 bg-black py-16 text-white sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black uppercase leading-none sm:text-5xl">
            Nuestros
            <br />
            Servicios
          </h2>
        </div>

        {/* En movil es un mosaico de dos columnas; desde sm vuelve a la
            cuadricula pareja, donde el multicolumna deja de aplicar. */}
        <div
          className="
            mt-10 columns-2 gap-3
            sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6
            lg:grid-cols-3 xl:grid-cols-4
          "
        >
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/servicios/${category.slug}`}
              className="
                group relative mb-3 block break-inside-avoid
                overflow-hidden rounded-xl
                sm:mb-0
              "
            >
              <div
                className={`relative w-full bg-white/[0.04] sm:aspect-[3/4] ${
                  MOBILE_RATIOS[index % MOBILE_RATIOS.length]
                }`}
              >
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  // Una categoría sin imagen rompería next/image con src vacío.
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFD21C]/15 via-[#FF7A00]/10 to-[#FF3030]/15">
                    <Package className="h-12 w-12 text-white/25" />
                  </div>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition duration-300 group-hover:from-black/90" />

              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h3 className="text-lg font-bold leading-tight text-white sm:text-2xl">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
