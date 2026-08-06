import Link from "next/link";
import { Logo } from "./Logo";

export function Navbar() {
  return (
    <header className="fixed top-5 left-0 z-50 w-full">
      <nav className="mx-auto flex h-20 items-center justify-between rounded-xl bg-black px-8 w-[90%]">
        <Logo />
        <ul className="hidden items-center gap-10 text-1xl font-medium text-white md:flex">
          <li>
            <Link
              href="/"
              className="transition-colors duration-300 hover:text-[#F25C05]"
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              href="#servicios"
              className="transition-colors duration-300 hover:text-[#F25C05]"
            >
              Servicios
            </Link>
          </li>
          <li>
            <Link
              href="#portafolio"
              className="transition-colors duration-300 hover:text-[#F25C05]"
            >
              Portafolio
            </Link>
          </li>
          <li>
            <Link
              href="#nosotros"
              className="transition-colors duration-300 hover:text-[#F25C05]"
            >
              Nosotros
            </Link>
          </li>
          <li>
            <Link
              href="#contacto"
              className="transition-colors duration-300 hover:text-[#F25C05]"
            >
              Contacto
            </Link>
          </li>
        </ul>
        <Link
          href="/admin/login"
          className="
            rounded-xl
            bg-[#F25C05]
            px-6
            py-3
            font-semibold
            text-white
            transition-all
            duration-300
            hover:scale-105
            hover:bg-[#ff6d1b]
             "
        >
          Login
        </Link>
      </nav>
    </header>
  );
}
