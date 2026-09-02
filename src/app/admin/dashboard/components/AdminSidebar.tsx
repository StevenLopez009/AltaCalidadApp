"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Package,
  ShoppingCart,
  LogOut,
  House,
  Flame,
} from "lucide-react";
import { useRouter } from "next/navigation";

const menuItems = [
  {
    label: "Inicio",
    href: "/admin",
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
        col-span-2
        row-span-4
        flex
        min-h-[calc(100vh-4rem)]
        flex-col
        overflow-hidden
        rounded-[24px]
        border
        border-white/[0.06]
        bg-[#121215]
        shadow-[0_15px_40px_rgba(0,0,0,0.5)]
      "
    >
      {/* Logo */}
      <div className="border-b border-white/[0.06] px-6 py-6">
        <Link href="/admin" className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              border
              border-orange-500/30
              bg-orange-500/15
              text-orange-300
              shadow-[0_0_20px_rgba(251,146,60,0.2)]
            "
          >
            <Flame className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Alta Calidad
            </h1>
          </div>
        </Link>
      </div>

      {/* Navegación */}
      <nav className="flex flex-1 flex-col gap-1.5 px-4 py-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                group
                flex
                items-center
                gap-3.5
                rounded-2xl
                px-4
                py-3.5
                text-sm
                font-medium
                transition-all
                duration-300
                ${
                  isActive
                    ? `
                        border
                        border-orange-500/30
                        bg-orange-500/15
                        text-orange-200
                        shadow-[0_0_20px_rgba(251,146,60,0.15)]
                      `
                    : `
                        text-zinc-400
                        hover:bg-white/[0.03]
                        hover:text-zinc-200
                      `
                }
              `}
            >
              <Icon
                className={`
                  h-5
                  w-5
                  shrink-0
                  transition-all
                  duration-300
                  ${
                    isActive
                      ? "text-orange-300"
                      : "text-zinc-500 group-hover:text-orange-400 group-hover:scale-110"
                  }
                `}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/[0.06] p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="
    group
    flex
    w-full
    items-center
    gap-3.5
    rounded-2xl
    border
    border-transparent
    px-4
    py-3.5
    text-sm
    font-medium
    text-zinc-400
    transition-all
    duration-300

    hover:border-red-500/30
    hover:bg-red-500/10
    hover:text-red-300
    hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]
  "
        >
          <LogOut
            className="
      h-5
      w-5
      shrink-0
      transition-all
      duration-300
      group-hover:translate-x-1
      group-hover:text-red-400
    "
          />

          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
