"use client";

import { usePathname } from "next/navigation";

import AdminSidebar from "./dashboard/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // El login es la única vista del panel sin sesión, así que no lleva menú.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#f7f4ed]">
      <div className="relative mx-auto max-w-[1800px] px-4 pb-6 md:px-6 lg:px-8 lg:py-8">
        <AdminSidebar />

        <main className="ml-0 lg:ml-[260px]">{children}</main>
      </div>
    </div>
  );
}
