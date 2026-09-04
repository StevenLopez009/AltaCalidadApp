"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Building2,
  Package,
  ShoppingCart,
  LogOut,
  House,
  Flame,
} from "lucide-react";

const menuItems = [
  {
    label: "Inicio",
    href: "/admin/dashboard",
    icon: House,
  },
  {
    label: "Empresas",
    href: "/admin/company",
    icon: Building2,
  },
  {
    label: "Productos y servicios",
    href: "/admin/categories",
    icon: Package,
  },
  {
    label: "Crear Pedido",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("No fue posible cerrar la sesión");
      }

      router.replace("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  }

  return (
    <aside
      className="
        fixed
        left-4
        top-4
        z-40
        hidden
        h-[calc(100vh-2rem)]
        w-[245px]
        flex-col
        overflow-hidden
        rounded-[28px]
        bg-[#151515]
        lg:flex
      "
    >
      {/* ===================================================== */}
      {/* LOGO */}
      {/* ===================================================== */}

      <div className="relative overflow-hidden border-b border-white/10 px-6 py-7">
        {/* Decoración */}
        <div
          className="
            pointer-events-none
            absolute
            -right-10
            -top-10
            h-32
            w-32
            rounded-full
            bg-[#FFD21C]/10
            blur-3xl
          "
        />

        <Link href="/admin" className="group relative flex items-center gap-3">
          {/* Logo */}
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-[#FFD21C]
              to-[#FF7A00]
              text-[#111]
              transition-transform
              duration-300
              group-hover:rotate-[-6deg]
              group-hover:scale-105
            "
          >
            <Flame className="h-6 w-6 fill-current" />
          </div>

          <div className="leading-none">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#FFD21C]">
              Alta
            </p>

            <h1 className="mt-1 text-xl font-black uppercase tracking-[-0.04em] text-white">
              Calidad
            </h1>
          </div>
        </Link>
      </div>

      {/* ===================================================== */}
      {/* LABEL */}
      {/* ===================================================== */}

      <div className="px-6 pb-2 pt-7">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
          Panel de control
        </p>
      </div>

      {/* ===================================================== */}
      {/* NAVEGACIÓN */}
      {/* ===================================================== */}

      <nav className="flex flex-1 flex-col gap-1 px-3 py-3">
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          const isOrder = item.href === "/admin/orders";

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                group relative flex items-center gap-3
                overflow-hidden
                rounded-xl
                px-3
                py-3
                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-[#FFD21C] text-[#111]"
                    : isOrder
                      ? "mt-2 bg-[#FF7A00] text-white hover:bg-[#ff8a1a]"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-white"
                }
              `}
            >
              {/* Indicador lateral */}
              {isActive && !isOrder && (
                <span className="absolute left-0 top-0 h-full w-1 bg-[#FF3030]" />
              )}

              {/* Número */}
              <span
                className={`
                  w-5
                  text-[9px]
                  font-black
                  ${
                    isActive
                      ? "text-black/40"
                      : isOrder
                        ? "text-white/50"
                        : "text-zinc-700"
                  }
                `}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Icono */}
              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  transition-transform
                  duration-200
                  group-hover:scale-105

                  ${
                    isActive
                      ? "bg-black/10"
                      : isOrder
                        ? "bg-white/15"
                        : "bg-white/[0.04]"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Texto */}
              <span className="text-[13px] font-bold tracking-tight">
                {item.label}
              </span>

              {/* Flecha */}
              {isActive && (
                <span className="ml-auto text-lg font-black leading-none">
                  →
                </span>
              )}

              {/* Indicador pedido */}
              {isOrder && !isActive && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#FFD21C]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ===================================================== */}
      {/* MARCA */}
      {/* ===================================================== */}

      <div className="mx-5 mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFD21C] via-[#FF7A00] to-[#FF3030] p-[1px]">
        <div className="rounded-[15px] bg-[#151515] px-4 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">
            Producción
          </p>

          <p className="mt-1 text-xs font-bold text-white">
            Creamos. Producimos.
          </p>

          <div className="mt-3 flex gap-1">
            <span className="h-1 flex-1 rounded-full bg-[#FFD21C]" />
            <span className="h-1 flex-1 rounded-full bg-[#FF7A00]" />
            <span className="h-1 flex-1 rounded-full bg-[#FF3030]" />
          </div>
        </div>
      </div>

      {/* ===================================================== */}
      {/* LOGOUT */}
      {/* ===================================================== */}

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-left
            text-zinc-500
            transition-all
            duration-200
            hover:bg-[#FF3030]/10
            hover:text-[#FF5A5A]
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              bg-white/[0.04]
              transition-colors
              group-hover:bg-[#FF3030]/15
            "
          >
            <LogOut
              className="
                h-4
                w-4
                transition-transform
                duration-200
                group-hover:translate-x-0.5
              "
            />
          </div>

          <span className="text-[13px] font-bold">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
