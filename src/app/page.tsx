import { ServicesSection } from "../modules/home/components/ServicesSection";
import { PortfolioSection } from "../modules/home/components/PortafolioSection";
import Link from "next/link";
import { CarruselSection } from "../modules/home/components/CarruselSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-[#FF7A00] selection:text-white">
      {/* El Navbar es fixed, por lo que va por fuera o junto al carrusel sin saltos */}
      <CarruselSection />
      <ServicesSection />
      <PortfolioSection />

      <footer className="border-t border-white/10 bg-[#050505]">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 py-16 md:grid-cols-4">
          {/* Logo */}
          <div>
            <p className="mt-2 leading-7 text-white/60 text-sm">
              Especialistas en impresión publicitaria de gran formato, avisos,
              pendones, vinilos, señalización y soluciones visuales para
              empresas y negocios.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Servicios
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link
                  href="/servicios/plotter-ecosolvente"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Plotter Ecosolvente
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Avisos Publicitarios
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Señalización
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Vinilos
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Diseño Gráfico
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Empresa
            </h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="#servicios"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  href="#portafolio"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Portafolio
                </Link>
              </li>
              <li>
                <Link
                  href="#contacto"
                  className="hover:text-[#FFD21F] transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div id="contacto">
            <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Contáctanos
            </h3>
            <div className="space-y-3 text-sm text-white/60">
              <p>📍 Madrid, Cundinamarca</p>
              <p>📞 +57 300 000 0000</p>
              <p>✉ contacto@grancalidad.com</p>

              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-[#FFD21F] hover:text-black font-bold text-xs"
                >
                  FB
                </a>
                <a
                  href="#"
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-[#FFD21F] hover:text-black font-bold text-xs"
                >
                  IG
                </a>
                <a
                  href="#"
                  className="rounded-xl border border-white/10 bg-white/5 p-2.5 transition hover:bg-[#FFD21F] hover:text-black font-bold text-xs"
                >
                  WA
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 py-6 text-xs text-white/40 md:flex-row">
            <p>
              © {new Date().getFullYear()} Gran Calidad. Todos los derechos
              reservados.
            </p>
            <p>Desarrollado con alta calidad visual</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
