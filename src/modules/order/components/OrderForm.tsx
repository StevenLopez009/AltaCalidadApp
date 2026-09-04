"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Upload,
  User,
  X,
  Phone,
} from "lucide-react";

interface Company {
  id: number;
  name_company: string;
  discount_percentage: number;
}

interface Category {
  id: number;
  name: string;
}

interface Service {
  id: number;
  category_id: number;
  name: string;
  unit: string;
  price: number;
}

interface OrderItemForm {
  categoryId: string;
  serviceId: string;
  quantity: string;
  width: string;
  height: string;
  designFile: File | null;
  observations: string;
}

type CustomerType = "empresa" | "usuario";

export default function OrderForm() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customerType, setCustomerType] = useState<CustomerType>("empresa");
  const [companyId, setCompanyId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<OrderItemForm[]>([]);
  const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [companiesResponse, categoriesResponse, servicesResponse] =
          await Promise.all([
            fetch("/api/company"),
            fetch("/api/categories"),
            fetch("/api/services"),
          ]);

        if (!companiesResponse.ok) {
          throw new Error("Error cargando empresas");
        }

        if (!categoriesResponse.ok) {
          throw new Error("Error cargando categorías");
        }

        if (!servicesResponse.ok) {
          throw new Error("Error cargando servicios");
        }

        const companiesData = await companiesResponse.json();

        const categoriesData = await categoriesResponse.json();

        const servicesData = await servicesResponse.json();

        setCompanies(companiesData);
        setCategories(categoriesData);
        setServices(servicesData);
      } catch (error) {
        console.error("Error cargando datos:", error);

        alert("No se pudieron cargar los datos.");
      }
    }

    loadData();
  }, []);

  const selectedCompany = companies.find(
    (company) => company.id === Number(companyId),
  );

  const discountPercentage =
    customerType === "empresa"
      ? Number(selectedCompany?.discount_percentage) || 0
      : 0;

  function getSelectedService(item: OrderItemForm) {
    return services.find((service) => service.id === Number(item.serviceId));
  }

  function addItem(service: Service) {
    const existingIndex = items.findIndex(
      (item) => Number(item.serviceId) === service.id,
    );

    if (existingIndex !== -1) {
      setConfiguringIndex(existingIndex);
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        categoryId: String(service.category_id),
        serviceId: String(service.id),
        quantity: "1",
        width: "",
        height: "",
        designFile: null,
        observations: "",
      },
    ]);
  }

  function updateItem(
    index: number,
    field: keyof OrderItemForm,
    value: string | File | null,
  ) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
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

  // ============================================================
  // CAMBIAR CANTIDAD
  // ============================================================

  function changeQuantity(index: number, amount: number) {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const currentQuantity = Number(item.quantity) || 1;

        const newQuantity = Math.max(1, currentQuantity + amount);

        return {
          ...item,
          quantity: String(newQuantity),
        };
      }),
    );
  }

  // ============================================================
  // ELIMINAR ITEM
  // ============================================================

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );

    if (configuringIndex === index) {
      setConfiguringIndex(null);
    }
  }

  // ============================================================
  // SERVICIOS FILTRADOS
  // ============================================================

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        !selectedCategoryId ||
        service.category_id === Number(selectedCategoryId);

      const matchesSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategoryId, search]);

  // ============================================================
  // CALCULAR SUBTOTAL ITEM
  // ============================================================

  function calculateItemSubtotal(item: OrderItemForm) {
    const service = getSelectedService(item);

    if (!service) {
      return 0;
    }

    const quantity = Number(item.quantity) || 0;

    const width = Number(item.width) || 0;

    const height = Number(item.height) || 0;

    const price = Number(service.price) || 0;

    switch (service.unit) {
      case "m2":
        return width * height * quantity * price;

      case "metro":
        return width * quantity * price;

      default:
        return quantity * price;
    }
  }

  // ============================================================
  // SUBTOTAL
  // ============================================================

  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + calculateItemSubtotal(item),
      0,
    );
  }, [items, services]);

  // ============================================================
  // DESCUENTO
  // ============================================================

  const discountAmount = subtotal * (discountPercentage / 100);

  // ============================================================
  // TOTAL
  // ============================================================

  const total = subtotal - discountAmount;

  // ============================================================
  // FORMATO MONEDA
  // ============================================================

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ============================================================
  // VALIDAR ITEMS
  // ============================================================

  function validateItems() {
    if (items.length === 0) {
      alert("Agregue al menos un servicio al pedido.");

      return false;
    }

    for (const item of items) {
      const service = getSelectedService(item);

      if (!service) {
        alert("No se pudo encontrar uno de los servicios.");

        return false;
      }

      const quantity = Number(item.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        alert(`La cantidad de ${service.name} debe ser mayor a cero.`);

        return false;
      }

      // --------------------------------------------------------
      // M2
      // --------------------------------------------------------

      if (service.unit === "m2") {
        const width = Number(item.width);

        const height = Number(item.height);

        if (
          !item.width ||
          !item.height ||
          !Number.isFinite(width) ||
          !Number.isFinite(height) ||
          width <= 0 ||
          height <= 0
        ) {
          alert(
            `Debe ingresar una base y una altura válidas para ${service.name}.`,
          );

          setConfiguringIndex(
            items.findIndex(
              (currentItem) => currentItem.serviceId === item.serviceId,
            ),
          );

          return false;
        }
      }

      // --------------------------------------------------------
      // METRO
      // --------------------------------------------------------

      if (service.unit === "metro") {
        const width = Number(item.width);

        if (!item.width || !Number.isFinite(width) || width <= 0) {
          alert(`Debe ingresar una longitud válida para ${service.name}.`);

          setConfiguringIndex(
            items.findIndex(
              (currentItem) => currentItem.serviceId === item.serviceId,
            ),
          );

          return false;
        }
      }
    }

    return true;
  }

  // ============================================================
  // CREAR PEDIDO
  // ============================================================

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) {
      return;
    }

    // ----------------------------------------------------------
    // VALIDAR CLIENTE
    // ----------------------------------------------------------

    if (customerType === "empresa") {
      if (!companyId) {
        alert("Seleccione una empresa.");

        return;
      }
    }

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

    // ----------------------------------------------------------
    // FECHA
    // ----------------------------------------------------------

    if (!deliveryDate) {
      alert("Seleccione la fecha de entrega.");

      return;
    }

    // ----------------------------------------------------------
    // ITEMS
    // ----------------------------------------------------------

    if (!validateItems()) {
      return;
    }

    // ----------------------------------------------------------
    // TOTAL
    // ----------------------------------------------------------

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      alert("El subtotal del pedido no es válido.");

      return;
    }

    try {
      setSubmitting(true);

      // --------------------------------------------------------
      // ITEMS PARA API
      // --------------------------------------------------------

      const orderItems = items.map((item) => {
        const service = getSelectedService(item);

        return {
          categoryId: Number(item.categoryId),

          serviceId: Number(item.serviceId),

          quantity: Number(item.quantity),

          width: item.width ? Number(item.width) : null,

          height: item.height ? Number(item.height) : null,

          unit: service?.unit ?? null,

          observations: item.observations.trim() || null,
        };
      });

      // --------------------------------------------------------
      // FORMDATA
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // ARCHIVOS
      // --------------------------------------------------------

      items.forEach((item, index) => {
        if (item.designFile) {
          formData.append(`designFile_${index}`, item.designFile);
        }
      });

      // --------------------------------------------------------
      // REQUEST
      // --------------------------------------------------------

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error creando pedido");
      }

      alert("Pedido creado correctamente.");

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

  // ============================================================
  // RESET
  // ============================================================

  function resetForm() {
    setCustomerType("empresa");

    setCompanyId("");

    setCustomerName("");

    setCustomerPhone("");

    setDeliveryDate("");

    setSelectedCategoryId("");

    setSearch("");

    setItems([]);

    setConfiguringIndex(null);
  }

  // ============================================================
  // ITEM EN CONFIGURACIÓN
  // ============================================================

  const configuringItem =
    configuringIndex !== null ? items[configuringIndex] : null;

  const configuringService = configuringItem
    ? getSelectedService(configuringItem)
    : null;

  const configuringSubtotal = configuringItem
    ? calculateItemSubtotal(configuringItem)
    : 0;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="relative min-h-screen overflow-hidden bg-[#0b0b10] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8"
    >
      {/* =========================================================
        FONDO DECORATIVO
    ========================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />
        <div className="absolute right-[-120px] top-1/4 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[140px]" />
        <div className="absolute bottom-[-150px] left-1/3 h-[450px] w-[450px] rounded-full bg-red-500/10 blur-[140px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/[0.03] blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px]">
        {/* ======================================================
          HEADER
      ======================================================= */}

        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
            Administración / Pedidos
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
                Crear pedido
              </h1>

              <p className="mt-2 text-xs text-zinc-400 sm:text-sm">
                Selecciona los servicios y configura tu pedido.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-2xl border border-orange-400/20 bg-gradient-to-r from-yellow-400/[0.08] via-orange-500/[0.08] to-red-500/[0.08] px-4 py-2.5 shadow-[0_0_25px_rgba(255,122,0,0.08)] sm:flex">
              <ShoppingCart size={16} className="text-yellow-300" />

              <span className="text-xs font-bold text-zinc-300">
                {items.length} servicio{items.length !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
          INFORMACIÓN DEL CLIENTE
      ======================================================= */}

        <section className="mb-6 rounded-3xl border border-orange-500/15 bg-gradient-to-br from-white/[0.06] via-orange-500/[0.025] to-red-500/[0.02] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
          {/* HEADER */}

          <div className="mb-5 flex items-center justify-between border-b border-orange-500/10 pb-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
                Cliente
              </p>

              <h2 className="mt-1 bg-gradient-to-r from-white via-yellow-100 to-orange-300 bg-clip-text text-base font-black text-transparent sm:text-lg">
                Información del cliente
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Datos del pedido y fecha de entrega
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_25px_rgba(255,122,0,0.2)]">
              <User size={18} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
            {/* TIPO */}

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Tipo de cliente
              </label>

              <div className="flex rounded-2xl border border-white/10 bg-black/30 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType("empresa");
                    setCustomerName("");
                    setCustomerPhone("");
                  }}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all ${
                    customerType === "empresa"
                      ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black shadow-[0_0_20px_rgba(255,122,0,0.2)]"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <Building2 size={14} />
                  <span>Empresa</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCustomerType("usuario");
                    setCompanyId("");
                  }}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-bold transition-all ${
                    customerType === "usuario"
                      ? "bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black shadow-[0_0_20px_rgba(255,122,0,0.2)]"
                      : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                  }`}
                >
                  <User size={14} />
                  <span>Usuario</span>
                </button>
              </div>
            </div>

            {/* CLIENTE */}

            {customerType === "empresa" ? (
              <div className="min-w-0">
                <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                  Empresa
                </label>

                <div className="relative">
                  <Building2
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"
                  />

                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required
                    className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-xs font-medium text-white outline-none transition focus:border-yellow-400/50 focus:bg-orange-500/[0.04] focus:shadow-[0_0_20px_rgba(255,193,7,0.06)]"
                  >
                    <option value="" className="bg-[#111116]">
                      Seleccionar empresa
                    </option>

                    {companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                        className="bg-[#111116]"
                      >
                        {company.name_company}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCompany && discountPercentage > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                    Descuento aplicado: {discountPercentage}%
                  </div>
                )}
              </div>
            ) : (
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {/* NOMBRE */}

                <div className="min-w-0">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Cliente
                  </label>

                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"
                    />

                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nombre del cliente"
                      required
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-xs font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:bg-orange-500/[0.04] focus:shadow-[0_0_20px_rgba(255,193,7,0.06)]"
                    />
                  </div>
                </div>

                {/* TELÉFONO */}

                <div className="min-w-0">
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    Teléfono
                  </label>

                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"
                    />

                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="300 123 4567"
                      required
                      className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-xs font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/50 focus:bg-orange-500/[0.04] focus:shadow-[0_0_20px_rgba(255,193,7,0.06)]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FECHA */}

            <div className="min-w-0">
              <label className="mb-2 block text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Fecha de entrega
              </label>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400"
                />

                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-9 pr-3 text-xs font-medium text-white outline-none transition focus:border-yellow-400/50 focus:bg-orange-500/[0.04] focus:shadow-[0_0_20px_rgba(255,193,7,0.06)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
          CONTENIDO PRINCIPAL
      ======================================================= */}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* ====================================================
            CATÁLOGO
        ===================================================== */}

          <section className="min-w-0">
            <div className="rounded-3xl border border-orange-500/15 bg-gradient-to-br from-white/[0.06] via-orange-500/[0.025] to-red-500/[0.02] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
              {/* HEADER */}

              <div className="mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-300">
                  Catálogo
                </p>

                <h2 className="mt-1 bg-gradient-to-r from-white via-yellow-100 to-orange-300 bg-clip-text text-xl font-black tracking-tight text-transparent sm:text-2xl">
                  Selecciona tus servicios
                </h2>

                <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
                  Busca y agrega los servicios que necesitas.
                </p>
              </div>

              {/* BUSCADOR */}

              <div className="relative mb-5">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar servicios..."
                  className="h-12 w-full rounded-2xl border border-orange-500/20 bg-black/30 py-3 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-yellow-400/60 focus:bg-orange-500/[0.04] focus:shadow-[0_0_25px_rgba(255,193,7,0.08)] sm:text-sm"
                />
              </div>

              {/* CATEGORÍAS */}

              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("")}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all sm:px-5 sm:py-2.5 ${
                    selectedCategoryId === ""
                      ? "border border-yellow-300/40 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black shadow-[0_0_25px_rgba(255,122,0,0.25)]"
                      : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-yellow-200"
                  }`}
                >
                  Todos
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(String(category.id))}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all sm:px-5 sm:py-2.5 ${
                      selectedCategoryId === String(category.id)
                        ? "border border-yellow-300/40 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-black shadow-[0_0_25px_rgba(255,122,0,0.25)]"
                        : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-yellow-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* SERVICIOS */}

              {filteredServices.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-orange-500/20 bg-black/20 px-5 py-16 text-center">
                  <Package size={36} className="mx-auto text-orange-400/40" />

                  <h3 className="mt-4 text-sm font-bold text-white">
                    No encontramos servicios
                  </h3>

                  <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
                    Intenta buscar otro servicio o categoría.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredServices.map((service) => {
                    const alreadyAdded = items.some(
                      (item) => Number(item.serviceId) === service.id,
                    );

                    const category = categories.find(
                      (currentCategory) =>
                        currentCategory.id === service.category_id,
                    );

                    return (
                      <div
                        key={service.id}
                        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1c22] via-[#15151a] to-[#101014] transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/40 hover:shadow-[0_20px_50px_rgba(255,87,34,0.18)]"
                      >
                        {/* HALO */}

                        <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-yellow-400/20 via-orange-500/10 to-red-500/0 blur-2xl transition duration-500 group-hover:scale-150" />

                        {/* ICONO */}

                        <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-yellow-400/[0.04] via-orange-500/[0.03] to-red-500/[0.04]">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_30px_rgba(255,122,0,0.25)] transition duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-[0_0_40px_rgba(255,87,34,0.4)]">
                            <Package size={30} />
                          </div>

                          {alreadyAdded && (
                            <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-green-400/30 bg-green-400/10 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        {/* INFO */}

                        <div className="p-4 sm:p-5">
                          <p className="mb-1 truncate text-[10px] font-black uppercase tracking-[0.15em] text-yellow-300">
                            {category?.name || "Servicio"}
                          </p>

                          <h3 className="min-h-[42px] text-sm font-bold leading-5 text-white">
                            {service.name}
                          </h3>

                          <p className="mt-1 text-[11px] text-zinc-600">
                            Precio por {service.unit}
                          </p>

                          <div className="mt-5 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-600">Desde</p>

                              <p className="truncate bg-gradient-to-r from-yellow-200 via-orange-300 to-red-400 bg-clip-text text-base font-black text-transparent sm:text-lg">
                                {formatCurrency(Number(service.price))}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => addItem(service)}
                              className={
                                alreadyAdded
                                  ? "flex shrink-0 items-center gap-1.5 rounded-xl border border-green-400/30 bg-green-400/10 px-3 py-2.5 text-[11px] font-bold text-green-300 transition hover:bg-green-400/20"
                                  : "flex shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-3 py-2.5 text-[11px] font-black text-black shadow-[0_0_20px_rgba(255,122,0,0.18)] transition hover:scale-105 hover:shadow-[0_0_30px_rgba(255,87,34,0.35)]"
                              }
                            >
                              {alreadyAdded ? (
                                <>
                                  <Check size={14} />
                                  Ver
                                </>
                              ) : (
                                <>
                                  <Plus size={14} />
                                  Agregar
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* ====================================================
            CARRITO
        ===================================================== */}

          <aside className="h-fit xl:sticky xl:top-6">
            <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-b from-[#1b1b20] via-[#121217] to-[#0d0d12] shadow-[0_20px_70px_rgba(0,0,0,0.5)]">
              {/* HEADER */}

              <div className="flex items-center justify-between border-b border-orange-500/10 bg-gradient-to-r from-yellow-400/[0.04] via-orange-500/[0.05] to-red-500/[0.04] px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_25px_rgba(255,122,0,0.25)]">
                    <ShoppingCart size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-white sm:text-base">
                      Tu pedido
                    </h2>

                    <p className="text-[11px] text-zinc-500">
                      {items.length} servicio
                      {items.length !== 1 && "s"}
                    </p>
                  </div>
                </div>

                {items.length > 0 && (
                  <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 text-[11px] font-black text-black shadow-[0_0_15px_rgba(255,122,0,0.2)]">
                    {items.length}
                  </span>
                )}
              </div>

              {/* VACÍO */}

              {items.length === 0 ? (
                <div className="px-5 py-14 text-center sm:py-16">
                  <ShoppingCart
                    size={38}
                    className="mx-auto text-orange-400/30"
                  />

                  <h3 className="mt-4 text-sm font-bold text-white">
                    Tu carrito está vacío
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
                    Agrega servicios desde el catálogo para comenzar.
                  </p>
                </div>
              ) : (
                <div className="max-h-[520px] divide-y divide-orange-500/[0.07] overflow-y-auto">
                  {items.map((item, index) => {
                    const service = getSelectedService(item);

                    if (!service) {
                      return null;
                    }

                    const itemSubtotal = calculateItemSubtotal(item);

                    const requiresDimensions = service.unit === "m2";

                    const requiresLength = service.unit === "metro";

                    return (
                      <div
                        key={`${item.serviceId}-${index}`}
                        className="p-4 transition hover:bg-orange-500/[0.02] sm:p-5"
                      >
                        <div className="flex gap-3">
                          {/* ICONO */}

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-red-500/20 text-orange-300 sm:h-12 sm:w-12">
                            <Package size={19} />
                          </div>

                          {/* INFO */}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="truncate text-xs font-bold text-white sm:text-sm">
                                  {service.name}
                                </h3>

                                <p className="mt-1 text-[10px] text-zinc-600 sm:text-xs">
                                  {formatCurrency(Number(service.price))} /{" "}
                                  {service.unit}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="shrink-0 rounded-lg p-1.5 text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
                                title="Eliminar servicio"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>

                            {/* CANTIDAD */}

                            <div className="mt-4 flex items-center justify-between gap-3">
                              <div className="flex items-center overflow-hidden rounded-xl border border-orange-500/15 bg-black/30">
                                <button
                                  type="button"
                                  onClick={() => changeQuantity(index, -1)}
                                  className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:bg-orange-500/10 hover:text-yellow-300"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="flex min-w-8 justify-center text-xs font-black text-white">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => changeQuantity(index, 1)}
                                  className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:bg-orange-500/10 hover:text-yellow-300"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <p className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-sm font-black text-transparent">
                                {formatCurrency(itemSubtotal)}
                              </p>
                            </div>

                            {/* MEDIDAS */}

                            <div className="mt-3 flex flex-wrap gap-2">
                              {requiresDimensions &&
                                item.width &&
                                item.height && (
                                  <span className="rounded-lg border border-orange-500/10 bg-orange-500/[0.05] px-2 py-1 text-[10px] text-orange-200/70">
                                    {item.width} × {item.height} m
                                  </span>
                                )}

                              {requiresLength && item.width && (
                                <span className="rounded-lg border border-orange-500/10 bg-orange-500/[0.05] px-2 py-1 text-[10px] text-orange-200/70">
                                  {item.width} m
                                </span>
                              )}

                              {item.designFile && (
                                <span className="max-w-[150px] truncate rounded-lg border border-yellow-400/10 bg-yellow-400/[0.05] px-2 py-1 text-[10px] text-yellow-200">
                                  📎 {item.designFile.name}
                                </span>
                              )}
                            </div>

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
              )}

              {/* ==================================================
                RESUMEN
            =================================================== */}

              {items.length > 0 && (
                <div className="border-t border-orange-500/15 bg-gradient-to-b from-orange-500/[0.04] to-red-500/[0.02] p-4 sm:p-5">
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>

                      <span className="font-bold text-white">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    {discountPercentage > 0 && (
                      <div className="flex justify-between font-semibold text-green-400">
                        <span>Descuento ({discountPercentage}%)</span>

                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* TOTAL */}

                  <div className="mt-5 border-t border-orange-500/10 pt-5">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-xs font-medium text-zinc-500">
                        Total
                      </span>

                      <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-2xl font-black text-transparent sm:text-3xl">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* CREAR */}

                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-5 py-4 text-sm font-black text-black shadow-[0_0_30px_rgba(255,122,0,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[0_0_45px_rgba(255,87,34,0.4)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:py-4"
                  >
                    {submitting ? "Creando pedido..." : "Crear pedido"}

                    {!submitting && <ChevronRight size={18} />}
                  </button>

                  {/* CANCELAR */}

                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="mt-2 w-full rounded-xl py-3 text-xs font-semibold text-zinc-600 transition hover:bg-white/[0.03] hover:text-white disabled:opacity-50"
                  >
                    Cancelar pedido
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* ======================================================
          MODAL CONFIGURACIÓN
      ======================================================= */}

        {configuringItem && configuringService && configuringIndex !== null && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4 md:p-6">
            <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-orange-500/20 bg-gradient-to-b from-[#1d1d22] via-[#15151a] to-[#101014] shadow-[0_25px_90px_rgba(0,0,0,0.65)] sm:max-h-[90vh] sm:rounded-3xl">
              {/* HEADER */}

              <div className="flex shrink-0 items-center justify-between border-b border-orange-500/15 bg-gradient-to-r from-yellow-400/[0.05] via-orange-500/[0.05] to-red-500/[0.05] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-orange-500 to-red-500 text-white shadow-[0_0_25px_rgba(255,122,0,0.25)]">
                    <Package size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-300">
                      Configurar servicio
                    </p>

                    <h2 className="truncate text-sm font-black text-white sm:text-base">
                      {configuringService.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfiguringIndex(null)}
                  className="shrink-0 rounded-xl p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <X size={19} />
                </button>
              </div>

              {/* BODY */}

              <div className="overflow-y-auto p-4 sm:p-6">
                {/* PRECIO */}

                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-orange-500/15 bg-gradient-to-r from-yellow-400/[0.05] via-orange-500/[0.05] to-red-500/[0.04] p-4 shadow-[0_0_25px_rgba(255,122,0,0.05)]">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                      Precio
                    </p>

                    <p className="mt-1 text-sm font-bold text-white">
                      {formatCurrency(Number(configuringService.price))}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-500/20 px-2.5 py-1.5 text-[10px] font-bold text-yellow-300">
                    Por {configuringService.unit}
                  </span>
                </div>

                {/* CANTIDAD */}

                <div className="mb-5">
                  <label className="mb-2 block text-xs font-bold text-zinc-400">
                    Cantidad
                  </label>

                  <div className="flex w-fit items-center overflow-hidden rounded-xl border border-orange-500/15 bg-black/30">
                    <button
                      type="button"
                      onClick={() => changeQuantity(configuringIndex, -1)}
                      className="flex h-11 w-11 items-center justify-center text-zinc-500 transition hover:bg-orange-500/10 hover:text-yellow-300"
                    >
                      <Minus size={17} />
                    </button>

                    <input
                      type="number"
                      min="1"
                      value={configuringItem.quantity}
                      onChange={(e) =>
                        updateItem(configuringIndex, "quantity", e.target.value)
                      }
                      className="h-11 w-16 bg-transparent text-center text-sm font-black text-white outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => changeQuantity(configuringIndex, 1)}
                      className="flex h-11 w-11 items-center justify-center text-zinc-500 transition hover:bg-orange-500/10 hover:text-yellow-300"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>

                {/* DIMENSIONES */}

                {(configuringService.unit === "m2" ||
                  configuringService.unit === "metro") && (
                  <div className="mb-5">
                    <label className="mb-2 block text-xs font-bold text-zinc-400">
                      Dimensiones
                    </label>

                    <div
                      className={`grid gap-3 ${
                        configuringService.unit === "m2"
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-1"
                      }`}
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
                            className="h-11 w-full rounded-xl border border-white/10 bg-black/30 p-3 pr-10 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50 focus:bg-orange-500/[0.04]"
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
                              className="h-11 w-full rounded-xl border border-white/10 bg-black/30 p-3 pr-10 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50 focus:bg-orange-500/[0.04]"
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

                <div className="mb-5">
                  <label className="mb-2 block text-xs font-bold text-zinc-400">
                    Archivo de diseño
                  </label>

                  <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-400/30 bg-gradient-to-br from-yellow-400/[0.04] via-orange-500/[0.04] to-red-500/[0.04] px-5 py-8 text-center transition hover:border-yellow-300/60 hover:bg-orange-500/[0.08] hover:shadow-[0_0_35px_rgba(255,122,0,0.12)]">
                    <Upload
                      size={25}
                      className="text-yellow-300 transition group-hover:scale-110 group-hover:text-orange-400"
                    />

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
                    <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-orange-500/10 bg-orange-500/[0.04] px-3 py-2.5">
                      <span className="min-w-0 truncate text-[11px] text-yellow-200">
                        📎 {configuringItem.designFile.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateItem(configuringIndex, "designFile", null)
                        }
                        className="shrink-0 text-[10px] font-semibold text-red-400 transition hover:text-red-300"
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
                      updateItem(
                        configuringIndex,
                        "observations",
                        e.target.value,
                      )
                    }
                    placeholder="Agrega especificaciones o instrucciones..."
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3.5 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-yellow-400/50 focus:bg-orange-500/[0.04]"
                  />
                </div>

                {/* SUBTOTAL */}

                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-orange-400/20 bg-gradient-to-r from-yellow-400/[0.06] via-orange-500/[0.08] to-red-500/[0.05] p-4 shadow-[0_0_30px_rgba(255,122,0,0.08)]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                      Subtotal del servicio
                    </p>

                    <p className="mt-1 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text text-2xl font-black text-transparent">
                      {formatCurrency(configuringSubtotal)}
                    </p>
                  </div>

                  <Check size={22} className="shrink-0 text-yellow-300" />
                </div>

                {/* GUARDAR */}

                <button
                  type="button"
                  onClick={() => setConfiguringIndex(null)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 px-5 py-4 text-sm font-black text-black shadow-[0_0_25px_rgba(255,122,0,0.2)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(255,87,34,0.35)]"
                >
                  <Check size={17} />
                  Guardar configuración
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
