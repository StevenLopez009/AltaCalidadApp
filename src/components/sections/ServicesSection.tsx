import {
  Palette,
  Printer,
  Megaphone,
  ShoppingBag,
  Globe,
  Camera,
} from "lucide-react";

import { listCategories } from "@/src/services/categories.service";
import Link from "next/link";

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

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => {
            const Icon = icons[index % icons.length];

            return (
              <article
                key={category.id}
                className="
                group
                relative
                overflow-hidden
                border border-white/10
                bg-white/5
                p-8
                backdrop-blur-xl
                transition-all duration-300
                hover:-translate-y-2
                hover:border-orange-500/40
                "
              >
                <div className="absolute right-0 top-0 h-8 w-8 bg-black" />

                <div
                  className="
                  flex h-16 w-16 items-center justify-center
                  bg-gradient-to-br
                  from-yellow-300
                  via-orange-500
                  to-red-600
                  transition-transform duration-300
                  group-hover:scale-110
                  "
                  style={{
                    clipPath: "polygon(0 0,100% 0,100% 75%,75% 100%,0 100%)",
                  }}
                >
                  <Icon size={30} className="text-white" strokeWidth={2.3} />
                </div>

                <h3 className="mt-8 text-2xl font-bold uppercase">
                  {category.name}
                </h3>

                <p className="mt-4 leading-7 text-white/60">
                  {category.description}
                </p>

                <Link
                  href={`/servicios/${category.slug}`}
                  className="
                    mt-8
                    inline-block
                    text-sm
                    font-semibold
                    uppercase
                    tracking-wider
                    text-orange-400
                    transition
                    group-hover:text-orange-300
                  "
                >
                  Ver más →
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
