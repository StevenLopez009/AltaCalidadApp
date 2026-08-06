import Image from "next/image";
import { Navbar } from "../shared/components/Navbar";
import { HeroBackground } from "../modules/home/components/HeroBackground";
import { ServicesSection } from "../modules/home/components/ServicesSection";
import { PortfolioSection } from "../modules/home/components/PortafolioSection";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="relative min-h-screen overflow-hidden">
        <HeroBackground />
        <Navbar />
        <div className="relative z-70 mx-auto flex min-h-screen max-w-7xl items-center px-8 pt-10">
          <div className="flex-1">
            <h1 className="mb-8 text-7xl font-black uppercase leading-[0.9] tracking-tight text-white">
              IDEAS
              <br />
              QUE
              <br />
              <span className="text-black">CONECTAN</span>
            </h1>

            <p className="mb-10 max-w-lg text-2xl leading-8 text-white/80">
              Convertimos tu marca en experiencias visuales con impresión
              publicitaria de alto impacto. Creamos piezas únicas que comunican,
              destacan y hacen crecer tu negocio.
            </p>

            <div className="flex gap-5">
              <button className="rounded-xl bg-black px-8 py-4 font-semibold text-white transition hover:scale-105">
                VER SERVICIOS
              </button>

              <button className="rounded-xl border border-white/20 px-8 py-4 backdrop-blur-md transition hover:bg-white hover:text-black">
                VER PORTAFOLIO
              </button>
            </div>
          </div>

          <div className="relative flex h-screen flex-1 items-center justify-end">
            <Image
              src="/images/image2.png"
              alt="Publicidad"
              width={700}
              height={700}
              priority
              className="
                relative z-50
                h-full
                w-auto
                max-w-xl
                object-contain
                drop-shadow-2xl
              "
            />
          </div>
        </div>
      </section>
      <ServicesSection />
      <PortfolioSection />
      <footer className="border-t border-white/10 bg-[#050505]">
        <div className="mx-auto grid max-w-7xl gap-12 px-8 py-16 md:grid-cols-4">
          {/* Logo */}
          <div>
            <p className="mt-6 leading-7 text-white/60">
              Especialistas en impresión publicitaria de gran formato, avisos,
              pendones, vinilos, señalización y soluciones visuales para
              empresas y negocios.
            </p>
          </div>

          {/* Servicios */}
          <div>
            <h3 className="mb-5 text-lg font-bold uppercase text-white">
              Servicios
            </h3>

            <ul className="space-y-3 text-white/60">
              <li>
                <Link href="/servicios/plotter-ecosolvente">
                  Plotter Ecosolvente
                </Link>
              </li>

              <li>
                <Link href="/">Avisos Publicitarios</Link>
              </li>

              <li>
                <Link href="/">Señalización</Link>
              </li>

              <li>
                <Link href="/">Vinilos</Link>
              </li>

              <li>
                <Link href="/">Diseño Gráfico</Link>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h3 className="mb-5 text-lg font-bold uppercase text-white">
              Empresa
            </h3>

            <ul className="space-y-3 text-white/60">
              <li>
                <Link href="/">Inicio</Link>
              </li>

              <li>
                <Link href="#servicios">Servicios</Link>
              </li>

              <li>
                <Link href="#portafolio">Portafolio</Link>
              </li>

              <li>
                <Link href="#contacto">Contacto</Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="mb-5 text-lg font-bold uppercase text-white">
              Contáctanos
            </h3>

            <div className="space-y-4 text-white/60">
              <p>📍 Madrid, Cundinamarca</p>

              <p>📞 +57 300 000 0000</p>

              <p>✉ contacto@grancalidad.com</p>

              <div className="flex gap-3 pt-4">
                <a
                  href="#"
                  className="rounded-full border border-orange-500/30 p-3 transition hover:bg-orange-500"
                >
                  FB
                </a>

                <a
                  href="#"
                  className="rounded-full border border-orange-500/30 p-3 transition hover:bg-orange-500"
                >
                  IG
                </a>

                <a
                  href="#"
                  className="rounded-full border border-orange-500/30 p-3 transition hover:bg-orange-500"
                >
                  WA
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-8 py-6 text-sm text-white/50 md:flex-row">
            <p>
              © {new Date().getFullYear()} Gran Calidad. Todos los derechos
              reservados.
            </p>

            <p>Desarrollado con ❤️ por Alta Calidad</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
