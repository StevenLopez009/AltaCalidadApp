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

        <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 sm:mt-16">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/servicios/${category.slug}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <div className="relative aspect-[3/4] w-full bg-white/[0.04]">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
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

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white">
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
