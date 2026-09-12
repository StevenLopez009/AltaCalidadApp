"use client";

import { useEffect, useMemo, useState } from "react";

import { WHATSAPP_NUMBER } from "@/src/shared/config/contact";

import {
  Building2,
  Check,
  Minus,
  Package,
  Phone,
  Plus,
  ShoppingCart,
  Copy,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";

import type { Service } from "@/src/shared/types/service";

interface Category {
  id: number;
  name: string;
}

interface Props {
  category: Category;
  services: Service[];
}

interface Addon {
  id: number;
  service_id: number;
  name: string;
  price: number;
}

/** Adicionales elegidos en una línea: id del adicional y cuántos van. */
type SelectedAddons = Record<number, number>;

interface CartItem {
  id: string;
  categoryId: number;
  serviceId: number;
  quantity: number;
  width: string;
  height: string;
  observations: string;
  designFile: File | null;
  addons: SelectedAddons;
}

type CustomerType = "empresa" | "usuario";

type PaymentOption = "ninguno" | "total" | "parcial";

type PaymentMethod = "efectivo" | "digital";

interface Company {
  id: number;
  name_company: string;
  discount_percentage: number;
}



export function CategoryServices({ category, services }: Props) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);

  // ==========================================
  // CLIENTE
  // ==========================================

  const [companies, setCompanies] = useState<Company[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [customerType, setCustomerType] = useState<CustomerType>("empresa");
  const [companyId, setCompanyId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // ==========================================
  // PEDIDO
  // ==========================================

  const [deliveryDate, setDeliveryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [paymentOption, setPaymentOption] = useState<PaymentOption>("ninguno");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");

  // ==========================================
  // CARGAR EMPRESAS
  // ==========================================

  useEffect(() => {
    async function loadAddons() {
      try {
        const response = await fetch("/api/services/addons");

        if (response.ok) {
          setAddons(await response.json());
        }
      } catch (error) {
        console.error("Error cargando adicionales:", error);
      }
    }

    loadAddons();

    async function loadCompanies() {
      try {
        const response = await fetch("/api/company");

        if (!response.ok) {
          throw new Error("Error cargando empresas");
        }

        const data = await response.json();

        setCompanies(data);
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    }

    loadCompanies();
  }, []);

  // ==========================================
  // EMPRESA SELECCIONADA
  // ==========================================

  const selectedCompany = companies.find(
    (company) => company.id === Number(companyId),
  );

  const discountPercentage =
    customerType === "empresa"
      ? Number(selectedCompany?.discount_percentage) || 0
      : 0;

  // ==========================================
  // FORMATEAR MONEDA
  // ==========================================

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ==========================================
  // OBTENER SERVICIO
  // ==========================================

  function getService(serviceId: number) {
    return services.find((service) => service.id === serviceId);
  }

  // ==========================================
  // AGREGAR SERVICIO
  // ==========================================

  function addService(service: Service) {
    const newItem: CartItem = {
      id: crypto.randomUUID(),
      categoryId: Number(service.category_id),
      serviceId: Number(service.id),
      quantity: 1,
      width: "",
      height: "",
      observations: "",
      designFile: null,
      addons: {},
    };

    setItems((current) => [...current, newItem]);
  }

  // Copia una línea para pedir el mismo servicio con otras medidas.
  function duplicateItem(index: number) {
    setItems((current) => {
      const copy = { ...current[index], id: crypto.randomUUID() };

      return [
        ...current.slice(0, index + 1),
        copy,
        ...current.slice(index + 1),
      ];
    });

    setConfiguringIndex(index + 1);
  }

  function getAddonsForService(serviceId: number) {
    return addons.filter((addon) => addon.service_id === Number(serviceId));
  }

  function calculateAddonsSubtotal(item: CartItem) {
    return Object.entries(item.addons ?? {}).reduce((total, [id, qty]) => {
      const addon = addons.find((option) => option.id === Number(id));

      return total + (Number(addon?.price) || 0) * (Number(qty) || 0);
    }, 0);
  }

  function toggleAddon(index: number, addonId: number) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        const next = { ...item.addons };

        if (next[addonId]) {
          delete next[addonId];
        } else {
          next[addonId] = Number(item.quantity) || 1;
        }

        return { ...item, addons: next };
      }),
    );
  }

  function setAddonQuantity(index: number, addonId: number, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          addons: { ...item.addons, [addonId]: Math.max(Number(value) || 0, 0) },
        };
      }),
    );
  }

  // ==========================================
  // ELIMINAR SERVICIO
  // ==========================================

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));

    if (configuringIndex !== null && items[configuringIndex]?.id === id) {
      setConfiguringIndex(null);
    }
  }

  // ==========================================
  // CAMBIAR CANTIDAD
  // ==========================================

  function changeQuantity(index: number, amount: number) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          quantity: Math.max(1, item.quantity + amount),
        };
      }),
    );
  }

  // ==========================================
  // ACTUALIZAR ITEM
  // ==========================================

  function updateItem(
    index: number,
    field: keyof CartItem,
    value: string | File | null | number,
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  // ==========================================
  // CALCULAR SUBTOTAL ITEM
  // ==========================================

  function calculateItemSubtotal(item: CartItem) {
    const service = getService(item.serviceId);

    if (!service) {
      return 0;
    }

    const quantity = Number(item.quantity) || 0;
    const width = Number(item.width) || 0;
    const height = Number(item.height) || 0;
    const price = Number(service.price) || 0;

    const base =
      service.unit === "m2"
        ? width * height * quantity * price
        : service.unit === "metro"
          ? width * quantity * price
          : quantity * price;

    return base + calculateAddonsSubtotal(item);
  }

  // ==========================================
  // SUBTOTAL GENERAL
  // ==========================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + calculateItemSubtotal(item),
      0,
    );
  }, [items, services, addons]);

  // ==========================================
  // DESCUENTO
  // ==========================================

  const discountAmount = subtotal * (discountPercentage / 100);

  const total = subtotal - discountAmount;

  // ==========================================
  // PAGO
  // ==========================================

  const paidAmount =
    paymentOption === "total"
      ? total
      : paymentOption === "parcial"
        ? Number(paymentAmount) || 0
        : 0;

  const amountDue = Math.max(total - paidAmount, 0);

  // ==========================================
  // ITEM QUE SE ESTÁ CONFIGURANDO
  // ==========================================

  const configuringItem =
    configuringIndex !== null ? items[configuringIndex] : null;

  const configuringService = configuringItem
    ? getService(configuringItem.serviceId)
    : null;

  const configuringSubtotal = configuringItem
    ? calculateItemSubtotal(configuringItem)
    : 0;

  // ==========================================
  // CAMBIAR TIPO DE CLIENTE
  // ==========================================

  function handleCustomerTypeChange(type: CustomerType) {
    setCustomerType(type);

    if (type === "empresa") {
      setCustomerName("");
      setCustomerPhone("");
    }

    if (type === "usuario") {
      setCompanyId("");
    }
  }

  // ==========================================
  // VALIDAR ITEMS
  // ==========================================

  function validateItems() {
    if (items.length === 0) {
      alert("Agregue al menos un servicio.");
      return false;
    }

    for (const item of items) {
      const service = getService(item.serviceId);

      if (!service) {
        alert("Uno de los servicios seleccionados no existe.");
        return false;
      }

      if (service.unit === "m2") {
        if (
          !item.width ||
          !item.height ||
          Number(item.width) <= 0 ||
          Number(item.height) <= 0
        ) {
          alert(`Configure las dimensiones del servicio "${service.name}".`);

          return false;
        }
      }

      if (service.unit === "metro") {
        if (!item.width || Number(item.width) <= 0) {
          alert(`Configure la longitud del servicio "${service.name}".`);

          return false;
        }
      }

      if (!item.quantity || Number(item.quantity) <= 0) {
        alert(`La cantidad del servicio "${service.name}" no es válida.`);

        return false;
      }
    }

    return true;
  }

  function buildWhatsAppMessage() {
    const lines: string[] = [];

    lines.push("🧾 *NUEVO PEDIDO - GRAN CALIDAD*");
    lines.push("");

    if (customerType === "empresa") {
      const company = companies.find((item) => item.id === Number(companyId));

      lines.push(`🏢 *Empresa:* ${company?.name_company ?? "No especificada"}`);
    } else {
      lines.push(`👤 *Cliente:* ${customerName.trim()}`);
      lines.push(`📱 *Teléfono:* ${customerPhone.trim()}`);
    }

    lines.push(`📅 *Fecha de entrega:* ${deliveryDate}`);
    lines.push("");
    lines.push("📦 *DETALLE DEL PEDIDO*");
    lines.push("");

    items.forEach((item, index) => {
      const service = getService(item.serviceId);

      if (!service) return;

      const itemSubtotal = calculateItemSubtotal(item);

      lines.push(`*${index + 1}. ${service.name}*`);

      lines.push(`   Cantidad: ${item.quantity}`);

      if (service.unit === "m2") {
        lines.push(`   Medidas: ${item.width} m × ${item.height} m`);
      }

      if (service.unit === "metro") {
        lines.push(`   Medida: ${item.width} m`);
      }

      Object.entries(item.addons ?? {}).forEach(([addonId, addonQuantity]) => {
        const addon = addons.find((option) => option.id === Number(addonId));

        if (!addon) return;

        lines.push(
          `   + ${addon.name} ×${addonQuantity}: ${formatCurrency(
            Number(addon.price) * Number(addonQuantity),
          )}`,
        );
      });

      if (item.observations.trim()) {
        lines.push(`   Observaciones: ${item.observations.trim()}`);
      }

      lines.push(`   Subtotal: ${formatCurrency(itemSubtotal)}`);

      if (item.designFile) {
        lines.push(`   📎 Diseño adjunto: ${item.designFile.name}`);
      }

      lines.push("");
    });

    lines.push("💰 *RESUMEN*");
    lines.push(`Subtotal: ${formatCurrency(subtotal)}`);

    if (discountPercentage > 0) {
      lines.push(
        `Descuento (${discountPercentage}%): -${formatCurrency(discountAmount)}`,
      );
    }

    lines.push(`*TOTAL: ${formatCurrency(total)}*`);

    if (paidAmount > 0) {
      lines.push("");
      lines.push(
        `💵 *Abonado (${paymentMethod}):* ${formatCurrency(paidAmount)}`,
      );

      lines.push(`Saldo pendiente: ${formatCurrency(amountDue)}`);
    }

    lines.push("");
    lines.push("Gracias por elegir *Gran Calidad*.");

    return lines.join("\n");
  }

  // ==========================================
  // CREAR PEDIDO
  // ==========================================

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    // ==========================================
    // VALIDAR CLIENTE EMPRESA
    // ==========================================

    if (customerType === "empresa") {
      if (!companyId) {
        alert("Seleccione una empresa.");
        return;
      }
    }

    // ==========================================
    // VALIDAR CLIENTE USUARIO
    // ==========================================

    if (customerType === "usuario") {
      if (!customerName.trim()) {
        alert("Ingrese el nombre del cliente.");
        return;
      }

      if (!customerPhone.trim()) {
        alert("Ingrese el teléfono del cliente.");
        return;
      }
    }

    // ==========================================
    // VALIDAR FECHA
    // ==========================================

    if (!deliveryDate) {
      alert("Seleccione la fecha de entrega.");
      return;
    }

    // ==========================================
    // VALIDAR ITEMS
    // ==========================================

    if (!validateItems()) {
      return;
    }

    // ==========================================
    // VALIDAR SUBTOTAL
    // ==========================================

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      alert("El subtotal del pedido no es válido.");
      return;
    }

    try {
      setSubmitting(true);

      // ==========================================
      // PREPARAR ITEMS
      // ==========================================

      if (paymentOption === "parcial") {
        if (!Number.isFinite(paidAmount) || paidAmount <= 0) {
          alert("Ingrese el monto abonado.");

          setSubmitting(false);

          return;
        }

        if (paidAmount > total) {
          alert("El abono no puede ser mayor al total del pedido.");

          setSubmitting(false);

          return;
        }
      }

      const orderItems = items.map((item) => {
        const service = getService(item.serviceId);

        return {
          categoryId: Number(item.categoryId),
          serviceId: Number(item.serviceId),
          quantity: Number(item.quantity),
          width: item.width ? Number(item.width) : null,
          height: item.height ? Number(item.height) : null,
          unit: service?.unit ?? null,
          observations: item.observations.trim() || null,

          addons: Object.entries(item.addons ?? {})
            .filter(([, quantity]) => Number(quantity) > 0)
            .map(([addonId, quantity]) => ({
              addonId: Number(addonId),
              quantity: Number(quantity),
            })),
        };
      });

      // ==========================================
      // FORMDATA
      // ==========================================

      const formData = new FormData();

      // Cliente
      formData.append("customerType", customerType);

      if (customerType === "empresa") {
        formData.append("companyId", companyId);
      }

      if (customerType === "usuario") {
        formData.append("customerName", customerName.trim());

        formData.append("customerPhone", customerPhone.trim());
      }

      // Pedido
      formData.append("deliveryDate", deliveryDate);

      formData.append("subtotal", String(subtotal));

      formData.append("discountPercentage", String(discountPercentage));

      formData.append("discountAmount", String(discountAmount));

      formData.append("total", String(total));

      formData.append("items", JSON.stringify(orderItems));

      // Pago
      if (paidAmount > 0) {
        formData.append("paymentAmount", String(paidAmount));

        formData.append("paymentMethod", paymentMethod);
      }

      // ==========================================
      // ARCHIVOS
      // ==========================================

      items.forEach((item, index) => {
        if (item.designFile) {
          formData.append(`designFile_${index}`, item.designFile);
        }
      });

      // ==========================================
      // ENVIAR PEDIDO
      // ==========================================

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error creando pedido");
      }

      const whatsappMessage = buildWhatsAppMessage();

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        whatsappMessage,
      )}`;

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      alert("Pedido creado correctamente. WhatsApp ha sido preparado.");

      resetForm();
    } catch (error) {
      console.error("Error creando pedido:", error);

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Error creando pedido.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================
  // RESET
  // ==========================================

  function resetForm() {
    setPaymentOption("ninguno");
    setPaymentAmount("");
    setPaymentMethod("efectivo");

    setCustomerType("empresa");
    setCompanyId("");
    setCustomerName("");
    setCustomerPhone("");
    setDeliveryDate("");
    setItems([]);
    setConfiguringIndex(null);
  }

  return (
    <>
      {/* ==========================================
          FONDO
      ========================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />

        <div className="absolute right-[-150px] top-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[140px]" />

        <div className="absolute bottom-[-150px] left-1/3 h-[450px] w-[450px] rounded-full bg-red-500/10 blur-[140px]" />
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="mx-auto max-w-[1500px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          {/* ==========================================
              HEADER
          ========================================== */}

          <header className="mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-300">
              Servicios
            </p>

            <div className="mt-2 flex items-end justify-between gap-5">
              <div>
                <h1 className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-3xl font-black tracking-tight text-transparent sm:text-4xl lg:text-5xl">
                  {category.name}
                </h1>

                <p className="mt-3 max-w-2xl text-sm text-zinc-500">
                  Selecciona los servicios que necesitas y agrégalos a tu
                  pedido.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-2xl border border-orange-500/20 bg-orange-500/[0.05] px-4 py-3 sm:flex">
                <ShoppingCart size={18} className="text-yellow-300" />

                <span className="text-xs font-bold text-zinc-300">
                  {items.length} servicio
                  {items.length !== 1 && "s"}
                </span>
              </div>
            </div>
          </header>

          {/* ==========================================
              CONTENIDO
          ========================================== */}

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
            {/* ==========================================
                SERVICIOS
            ========================================== */}

            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-400">
                    Catálogo
                  </p>

                  <h2 className="mt-1 text-xl font-black text-white">
                    Servicios disponibles
                  </h2>
                </div>

                <span className="text-xs text-zinc-600">
                  {services.length} disponibles
                </span>
              </div>

              {services.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-500/20 bg-white/[0.03] px-6 py-20 text-center">
                  <Package size={40} className="mx-auto text-orange-400/30" />

                  <h3 className="mt-4 text-sm font-bold">
                    No hay servicios disponibles
                  </h3>

                  <p className="mt-2 text-xs text-zinc-600">
                    Esta categoría todavía no tiene servicios.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <article
                      key={service.id}
                      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1b1b20] via-[#131318] to-[#0d0d11] transition duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-[0_20px_50px_rgba(255,87,34,0.15)]"
                    >
                      {/* HALO */}

                      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl transition duration-500 group-hover:scale-150" />

                      {/* ICONO */}

                      <div className="relative flex h-36 items-center justify-center border-b border-white/[0.05] bg-gradient-to-br from-yellow-400/[0.03] via-orange-500/[0.03] to-red-500/[0.04]">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_30px_rgba(255,122,0,0.2)] transition duration-300 group-hover:scale-110">
                          <Package size={30} />
                        </div>
                      </div>

                      {/* INFORMACIÓN */}

                      <div className="p-5">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                          Servicio
                        </p>

                        <h3 className="mt-2 min-h-[48px] text-sm font-black leading-6 text-white">
                          {service.name}
                        </h3>

                        <p className="mt-1 text-[11px] text-zinc-600">
                          Precio por {service.unit}
                        </p>

                        <div className="mt-6 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-zinc-600">Desde</p>

                            <p className="bg-gradient-to-r from-yellow-200 via-orange-300 to-red-400 bg-clip-text text-lg font-black text-transparent">
                              {formatCurrency(Number(service.price))}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => addService(service)}
                            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-3 py-2.5 text-[11px] font-black text-black shadow-[0_0_20px_rgba(255,122,0,0.18)] transition hover:scale-105"
                          >
                            <Plus size={14} />
                            Agregar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ==========================================
                CARRITO
            ========================================== */}

            <aside className="h-fit xl:sticky xl:top-6">
              <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-b from-[#1b1b20] via-[#121217] to-[#0c0c10] shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
                {/* HEADER CARRITO */}

                <div className="flex items-center justify-between border-b border-orange-500/10 bg-gradient-to-r from-yellow-400/[0.04] via-orange-500/[0.05] to-red-500/[0.04] px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_25px_rgba(255,122,0,0.25)]">
                      <ShoppingCart size={20} />
                    </div>

                    <div>
                      <h2 className="text-sm font-black text-white">
                        Tu pedido
                      </h2>

                      <p className="text-[11px] text-zinc-500">
                        {items.length} servicio
                        {items.length !== 1 && "s"}
                      </p>
                    </div>
                  </div>

                  {items.length > 0 && (
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 text-[11px] font-black text-black">
                      {items.length}
                    </span>
                  )}
                </div>

                {/* CLIENTE */}

                <div className="border-b border-orange-500/10 p-5">
                  <div className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-400">
                      Cliente
                    </p>

                    <h3 className="mt-1 text-sm font-black text-white">
                      ¿Para quién es el pedido?
                    </h3>
                  </div>

                  {/* TIPO CLIENTE */}

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCustomerTypeChange("empresa")}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                        customerType === "empresa"
                          ? "border-orange-400/50 bg-gradient-to-r from-yellow-400/15 via-orange-500/15 to-red-500/15 text-yellow-300 shadow-[0_0_20px_rgba(255,122,0,0.08)]"
                          : "border-white/10 bg-black/20 text-zinc-500 hover:border-orange-500/30 hover:text-zinc-300"
                      }`}
                    >
                      <Building2 size={16} />
                      Empresa
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCustomerTypeChange("usuario")}
                      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-bold transition ${
                        customerType === "usuario"
                          ? "border-orange-400/50 bg-gradient-to-r from-yellow-400/15 via-orange-500/15 to-red-500/15 text-yellow-300 shadow-[0_0_20px_rgba(255,122,0,0.08)]"
                          : "border-white/10 bg-black/20 text-zinc-500 hover:border-orange-500/30 hover:text-zinc-300"
                      }`}
                    >
                      <User size={16} />
                      Usuario
                    </button>
                  </div>

                  {/* EMPRESA */}

                  {customerType === "empresa" && (
                    <div className="mt-4">
                      <label className="mb-2 block text-[11px] font-bold text-zinc-500">
                        Seleccionar empresa
                      </label>

                      <select
                        value={companyId}
                        onChange={(e) => setCompanyId(e.target.value)}
                        className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-yellow-400/50"
                      >
                        <option value="" className="bg-[#15151a]">
                          Seleccione una empresa
                        </option>

                        {companies.map((company) => (
                          <option
                            key={company.id}
                            value={company.id}
                            className="bg-[#15151a]"
                          >
                            {company.name_company}
                          </option>
                        ))}
                      </select>

                      {selectedCompany && discountPercentage > 0 && (
                        <div className="mt-3 flex items-center justify-between rounded-xl border border-yellow-400/15 bg-yellow-400/[0.04] px-3 py-2.5">
                          <span className="text-[10px] text-zinc-500">
                            Descuento empresarial
                          </span>

                          <span className="text-xs font-black text-yellow-300">
                            {discountPercentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* USUARIO */}

                  {customerType === "usuario" && (
                    <div className="mt-4 space-y-3">
                      {/* NOMBRE */}

                      <div>
                        <label className="mb-2 block text-[11px] font-bold text-zinc-500">
                          Nombre del cliente
                        </label>

                        <div className="relative">
                          <User
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                          />

                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Nombre completo"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-yellow-400/50"
                          />
                        </div>
                      </div>

                      {/* TELÉFONO */}

                      <div>
                        <label className="mb-2 block text-[11px] font-bold text-zinc-500">
                          Teléfono del cliente
                        </label>

                        <div className="relative">
                          <Phone
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                          />

                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="300 000 0000"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-yellow-400/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FECHA DE ENTREGA */}

                  <div className="mt-4">
                    <label className="mb-2 block text-[11px] font-bold text-zinc-500">
                      Fecha de entrega
                    </label>

                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-xs text-white outline-none focus:border-yellow-400/50"
                    />
                  </div>
                </div>

                {/* CARRITO VACÍO */}

                {items.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <ShoppingCart
                      size={40}
                      className="mx-auto text-orange-400/25"
                    />

                    <h3 className="mt-4 text-sm font-bold text-white">
                      Tu carrito está vacío
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                      Agrega servicios desde el catálogo para comenzar tu
                      pedido.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ITEMS */}

                    <div className="max-h-[500px] divide-y divide-orange-500/[0.07] overflow-y-auto">
                      {items.map((item, index) => {
                        const service = getService(item.serviceId);

                        if (!service) {
                          return null;
                        }

                        const itemSubtotal = calculateItemSubtotal(item);

                        return (
                          <div
                            key={item.id}
                            className="p-5 transition hover:bg-orange-500/[0.02]"
                          >
                            <div className="flex gap-3">
                              {/* ICONO */}

                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-500/20 text-orange-300">
                                <Package size={19} />
                              </div>

                              {/* INFO */}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <h3 className="truncate text-xs font-bold text-white">
                                      {service.name}
                                    </h3>

                                    <p className="mt-1 text-[10px] text-zinc-600">
                                      {formatCurrency(Number(service.price))} /{" "}
                                      {service.unit}
                                    </p>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-0.5">
                                    <button
                                      type="button"
                                      onClick={() => duplicateItem(index)}
                                      title="Duplicar con otras medidas"
                                      className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-yellow-400/10 hover:text-yellow-300"
                                    >
                                      <Copy size={15} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => removeItem(item.id)}
                                      title="Eliminar servicio"
                                      className="rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </div>

                                {/* CANTIDAD */}

                                <div className="mt-4 flex items-center justify-between gap-3">
                                  <div className="flex items-center overflow-hidden rounded-xl border border-orange-500/15 bg-black/30">
                                    <button
                                      type="button"
                                      onClick={() => changeQuantity(index, -1)}
                                      className="flex h-8 w-8 items-center justify-center text-zinc-500 hover:bg-orange-500/10 hover:text-yellow-300"
                                    >
                                      <Minus size={14} />
                                    </button>

                                    <span className="flex min-w-8 justify-center text-xs font-black text-white">
                                      {item.quantity}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => changeQuantity(index, 1)}
                                      className="flex h-8 w-8 items-center justify-center text-zinc-500 hover:bg-orange-500/10 hover:text-yellow-300"
                                    >
                                      <Plus size={14} />
                                    </button>
                                  </div>

                                  <p className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-sm font-black text-transparent">
                                    {formatCurrency(itemSubtotal)}
                                  </p>
                                </div>

                                {/* MEDIDAS */}

                                {((service.unit === "m2" &&
                                  (!item.width || !item.height)) ||
                                  (service.unit === "metro" &&
                                    !item.width)) && (
                                  <div className="mt-3">
                                    <span className="rounded-lg border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-300">
                                      Faltan medidas
                                    </span>
                                  </div>
                                )}

                                {Object.keys(item.addons ?? {}).length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {Object.entries(item.addons).map(
                                      ([addonId, addonQuantity]) => {
                                        const addon = addons.find(
                                          (option) =>
                                            option.id === Number(addonId),
                                        );

                                        if (!addon) return null;

                                        return (
                                          <span
                                            key={addonId}
                                            className="rounded-lg border border-yellow-400/20 bg-yellow-400/[0.07] px-2 py-1 text-[10px] text-yellow-200"
                                          >
                                            +{addon.name} ×{addonQuantity}
                                          </span>
                                        );
                                      },
                                    )}
                                  </div>
                                )}

                                {(service.unit === "m2" ||
                                  service.unit === "metro") &&
                                  item.width && (
                                    <div className="mt-3">
                                      <span className="rounded-lg border border-orange-500/10 bg-orange-500/[0.05] px-2 py-1 text-[10px] text-orange-200/70">
                                        {service.unit === "m2"
                                          ? `${item.width} × ${item.height} m`
                                          : `${item.width} m`}
                                      </span>
                                    </div>
                                  )}

                                {/* ARCHIVO */}

                                {item.designFile && (
                                  <div className="mt-3">
                                    <span className="block truncate text-[10px] text-zinc-600">
                                      📎 {item.designFile.name}
                                    </span>
                                  </div>
                                )}

                                {/* CONFIGURAR */}

                                <button
                                  type="button"
                                  onClick={() => setConfiguringIndex(index)}
                                  className="mt-4 text-[11px] font-bold text-yellow-300 transition hover:text-orange-400"
                                >
                                  Configurar servicio →
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* RESUMEN */}

                    <div className="border-t border-orange-500/15 bg-gradient-to-b from-orange-500/[0.04] to-red-500/[0.02] p-5">
                      {/* SUBTOTAL */}

                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>Subtotal</span>

                        <span className="font-bold text-white">
                          {formatCurrency(subtotal)}
                        </span>
                      </div>

                      {/* DESCUENTO */}

                      {customerType === "empresa" && discountPercentage > 0 && (
                        <div className="mt-3 flex justify-between text-xs">
                          <span className="text-zinc-500">
                            Descuento ({discountPercentage}
                            %)
                          </span>

                          <span className="font-bold text-yellow-300">
                            -{formatCurrency(discountAmount)}
                          </span>
                        </div>
                      )}

                      {/* TOTAL */}

                      <div className="mt-5 border-t border-orange-500/10 pt-5">
                        <div className="flex items-end justify-between">
                          <span className="text-xs text-zinc-500">Total</span>

                          <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-2xl font-black text-transparent">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      </div>

                      {/* PAGO */}

                      <div className="mt-5 border-t border-orange-500/10 pt-5">
                        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.15em] text-yellow-300">
                          Pago
                        </p>

                        <div className="grid grid-cols-3 gap-1.5">
                          {(
                            [
                              { value: "ninguno", label: "Sin pago" },
                              { value: "total", label: "Paga todo" },
                              { value: "parcial", label: "Parcial" },
                            ] as const
                          ).map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => setPaymentOption(option.value)}
                              className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${
                                paymentOption === option.value
                                  ? "border-yellow-400/50 bg-yellow-400/15 text-yellow-200"
                                  : "border-orange-500/10 bg-black/20 text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>

                        {paymentOption !== "ninguno" && (
                          <div className="mt-3 space-y-3">
                            {paymentOption === "parcial" && (
                              <div>
                                <label className="mb-1.5 block text-[11px] text-zinc-500">
                                  Monto abonado
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  max={total}
                                  step="any"
                                  value={paymentAmount}
                                  onChange={(e) =>
                                    setPaymentAmount(e.target.value)
                                  }
                                  placeholder="0"
                                  className="w-full rounded-xl border border-orange-500/15 bg-black/30 px-3 py-2.5 text-sm font-bold text-white outline-none transition focus:border-yellow-400/50"
                                />
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-1.5">
                              {(
                                [
                                  { value: "efectivo", label: "Efectivo" },
                                  { value: "digital", label: "Digital" },
                                ] as const
                              ).map((method) => (
                                <button
                                  key={method.value}
                                  type="button"
                                  onClick={() => setPaymentMethod(method.value)}
                                  className={`rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${
                                    paymentMethod === method.value
                                      ? "border-yellow-400/50 bg-yellow-400/15 text-yellow-200"
                                      : "border-orange-500/10 bg-black/20 text-zinc-500 hover:text-zinc-300"
                                  }`}
                                >
                                  {method.label}
                                </button>
                              ))}
                            </div>

                            <div className="flex justify-between rounded-xl bg-black/25 px-3 py-2.5 text-xs">
                              <span className="text-zinc-500">
                                Queda debiendo
                              </span>

                              <span
                                className={
                                  amountDue > 0
                                    ? "font-black text-orange-300"
                                    : "font-black text-green-400"
                                }
                              >
                                {formatCurrency(amountDue)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CONTINUAR */}

                      <button
                        type="submit"
                        disabled={submitting || items.length === 0}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-5 py-4 text-sm font-black text-black shadow-[0_0_30px_rgba(255,122,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(255,87,34,0.4)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        {submitting ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                            Creando pedido...
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={17} />
                            Continuar pedido
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </form>

      {/* ==========================================
          MODAL CONFIGURAR
      ========================================== */}

      {configuringItem && configuringService && configuringIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-orange-500/20 bg-gradient-to-b from-[#1d1d22] via-[#15151a] to-[#101014] shadow-[0_25px_90px_rgba(0,0,0,0.65)] sm:max-h-[90vh] sm:rounded-3xl">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-orange-500/15 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500">
                  <Package size={20} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                    Configurar servicio
                  </p>

                  <h2 className="mt-1 text-sm font-black text-white">
                    {configuringService.name}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfiguringIndex(null)}
                className="rounded-xl p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div className="overflow-y-auto p-5 sm:p-6">
              {/* PRECIO */}

              <div className="mb-6 flex items-center justify-between rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-600">
                    Precio
                  </p>

                  <p className="mt-1 text-sm font-bold text-white">
                    {formatCurrency(Number(configuringService.price))}
                  </p>
                </div>

                <span className="rounded-lg bg-orange-500/10 px-3 py-2 text-[10px] font-bold text-orange-300">
                  Por {configuringService.unit}
                </span>
              </div>

              {/* CANTIDAD */}

              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold text-zinc-400">
                  Cantidad
                </label>

                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-orange-500/15 bg-black/30">
                  <button
                    type="button"
                    onClick={() => changeQuantity(configuringIndex, -1)}
                    className="flex h-11 w-11 items-center justify-center text-zinc-500 hover:text-yellow-300"
                  >
                    <Minus size={17} />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={configuringItem.quantity}
                    onChange={(e) =>
                      updateItem(
                        configuringIndex,
                        "quantity",
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                    className="h-11 w-16 bg-transparent text-center text-sm font-black text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => changeQuantity(configuringIndex, 1)}
                    className="flex h-11 w-11 items-center justify-center text-zinc-500 hover:text-yellow-300"
                  >
                    <Plus size={17} />
                  </button>
                </div>
              </div>

              {/* DIMENSIONES */}

              {(configuringService.unit === "m2" ||
                configuringService.unit === "metro") && (
                <div className="mb-6">
                  <label className="mb-2 block text-xs font-bold text-zinc-400">
                    Dimensiones
                  </label>

                  <div
                    className={
                      configuringService.unit === "m2"
                        ? "grid gap-3 sm:grid-cols-2"
                        : "grid"
                    }
                  >
                    {/* ANCHO */}

                    <div>
                      <label className="mb-2 block text-[11px] text-zinc-600">
                        {configuringService.unit === "m2"
                          ? "Base / Ancho"
                          : "Longitud"}
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={configuringItem.width}
                          onChange={(e) =>
                            updateItem(
                              configuringIndex,
                              "width",
                              e.target.value,
                            )
                          }
                          placeholder="0.00"
                          className="h-11 w-full rounded-xl border border-white/10 bg-black/30 p-3 pr-10 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-yellow-400/50"
                        />

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-300">
                          m
                        </span>
                      </div>
                    </div>

                    {/* ALTO */}

                    {configuringService.unit === "m2" && (
                      <div>
                        <label className="mb-2 block text-[11px] text-zinc-600">
                          Altura
                        </label>

                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={configuringItem.height}
                            onChange={(e) =>
                              updateItem(
                                configuringIndex,
                                "height",
                                e.target.value,
                              )
                            }
                            placeholder="0.00"
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 p-3 pr-10 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-yellow-400/50"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-300">
                            m
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AREA */}

                  {configuringService.unit === "m2" &&
                    configuringItem.width &&
                    configuringItem.height && (
                      <p className="mt-2 text-[11px] font-semibold text-yellow-300">
                        Área calculada:{" "}
                        {(
                          Number(configuringItem.width) *
                          Number(configuringItem.height)
                        ).toFixed(2)}{" "}
                        m²
                      </p>
                    )}
                </div>
              )}

              {/* ARCHIVO */}

              <div className="mb-6">
                <label className="mb-2 block text-xs font-bold text-zinc-400">
                  Archivo de diseño
                </label>

                <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-400/30 bg-orange-500/[0.03] px-5 py-8 text-center transition hover:border-yellow-300/60 hover:bg-orange-500/[0.07]">
                  <Upload size={25} className="text-yellow-300" />

                  <span className="mt-2 text-xs font-bold text-white">
                    Seleccionar archivo
                  </span>

                  <span className="mt-1 text-[10px] text-zinc-600">
                    PDF, AI, CDR, SVG, PNG o JPG
                  </span>

                  <input
                    type="file"
                    accept=".pdf,.ai,.cdr,.svg,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={(e) =>
                      updateItem(
                        configuringIndex,
                        "designFile",
                        e.target.files?.[0] ?? null,
                      )
                    }
                  />
                </label>

                {configuringItem.designFile && (
                  <div className="mt-2 flex items-center justify-between rounded-xl border border-orange-500/10 bg-orange-500/[0.04] px-3 py-2.5">
                    <span className="truncate text-[11px] text-yellow-200">
                      📎 {configuringItem.designFile.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateItem(configuringIndex, "designFile", null)
                      }
                      className="text-[10px] font-semibold text-red-400"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* OBSERVACIONES */}

              <div>
                <label className="mb-2 block text-xs font-bold text-zinc-400">
                  Observaciones
                </label>

                <textarea
                  rows={4}
                  value={configuringItem.observations}
                  onChange={(e) =>
                    updateItem(configuringIndex, "observations", e.target.value)
                  }
                  placeholder="Agrega especificaciones o instrucciones..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3.5 text-xs text-white outline-none placeholder:text-zinc-700 focus:border-yellow-400/50"
                />
              </div>

              {/* ADICIONALES */}

              {getAddonsForService(configuringItem.serviceId).length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-yellow-300">
                    Adicionales
                  </p>

                  <div className="space-y-2">
                    {getAddonsForService(configuringItem.serviceId).map(
                      (addon) => {
                        const selected = Boolean(
                          configuringItem.addons?.[addon.id],
                        );

                        return (
                          <div
                            key={addon.id}
                            className={`flex flex-wrap items-center gap-2 rounded-xl border p-2.5 transition ${
                              selected
                                ? "border-yellow-400/40 bg-yellow-400/10"
                                : "border-white/[0.07] bg-black/25"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                toggleAddon(configuringIndex, addon.id)
                              }
                              className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                  selected
                                    ? "border-yellow-400 bg-yellow-400 text-black"
                                    : "border-white/20"
                                }`}
                              >
                                {selected && <Check size={13} />}
                              </span>

                              <span className="min-w-0">
                                <span className="block truncate text-xs font-semibold text-white">
                                  {addon.name}
                                </span>

                                <span className="block text-[10px] text-zinc-500">
                                  {formatCurrency(Number(addon.price))} c/u
                                </span>
                              </span>
                            </button>

                            {selected && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={configuringItem.addons[addon.id]}
                                  onChange={(e) =>
                                    setAddonQuantity(
                                      configuringIndex,
                                      addon.id,
                                      e.target.value,
                                    )
                                  }
                                  className="w-16 rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-center text-xs font-bold text-white outline-none focus:border-yellow-400/50"
                                />

                                <span className="w-24 text-right text-xs font-bold text-yellow-300">
                                  {formatCurrency(
                                    Number(addon.price) *
                                      Number(configuringItem.addons[addon.id]),
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              )}

              {/* SUBTOTAL */}

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-orange-400/20 bg-orange-500/[0.06] p-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                    Subtotal
                  </p>

                  <p className="mt-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-2xl font-black text-transparent">
                    {formatCurrency(configuringSubtotal)}
                  </p>

                  {calculateAddonsSubtotal(configuringItem) > 0 && (
                    <p className="mt-1 text-[10px] text-zinc-500">
                      Incluye{" "}
                      {formatCurrency(calculateAddonsSubtotal(configuringItem))}{" "}
                      en adicionales
                    </p>
                  )}
                </div>

                <Check size={22} className="text-yellow-300" />
              </div>

              {/* GUARDAR */}

              <button
                type="button"
                onClick={() => setConfiguringIndex(null)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-5 py-4 text-sm font-black text-black shadow-[0_0_25px_rgba(255,122,0,0.2)] transition hover:-translate-y-0.5"
              >
                <Check size={17} />
                Guardar configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
