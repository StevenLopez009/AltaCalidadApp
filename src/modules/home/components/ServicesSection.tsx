import {
  Palette,
  Printer,
  Megaphone,
  ShoppingBag,
  Globe,
  Camera,
} from "lucide-react";

import Link from "next/link";
import { listCategories } from "../../categories/services/categories.service";
import Image from "next/image";

const icons = [Palette, Printer, Megaphone, ShoppingBag, Globe, Camera];

export async function ServicesSection() {
  const categories = await listCategories();
  console.log(categories);
  return (
    <section className="relative z-20 bg-black py-24 text-white">
      <div className="mx-auto max-w-7xl px-8">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-black uppercase leading-none">
            Nuestros
            <br />
            Servicios
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/servicios/${category.slug}`}
              className="group relative overflow-hidden rounded-xl"
            >
              <Image
                src={category.image}
                alt={category.name}
                width={600}
                height={800}
              />

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
