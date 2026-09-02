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
      className="min-h-screen bg-[#121215] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1500px]">
        {/* ======================================================
        HEADER
    ======================================================= */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Administración / Pedidos
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Crear pedido
              </h1>

              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
                Selecciona los servicios y configura tu pedido.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-xl border border-orange-500/10 bg-orange-500/[0.04] px-3 py-2 sm:flex">
              <ShoppingCart size={15} className="text-orange-400" />
              <span className="text-xs font-medium text-zinc-400">
                {items.length} servicio{items.length !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================
        INFORMACIÓN DEL CLIENTE
    ======================================================= */}
        <section className="mb-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)] sm:p-6">
          {/* HEADER */}
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.06] pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-orange-400">
                Cliente
              </p>

              <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
                Información del cliente
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Datos del pedido y fecha de entrega
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-500/10 bg-orange-500/[0.06]">
              <User size={18} className="text-orange-400" />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
            {/* TIPO */}
            <div>
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Tipo de cliente
              </label>

              <div className="flex rounded-xl border border-white/[0.08] bg-[#121215] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerType("empresa");
                    setCustomerName("");
                    setCustomerPhone("");
                  }}
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition ${
                    customerType === "empresa"
                      ? "bg-orange-500/15 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.08)]"
                      : "text-zinc-500 hover:text-zinc-300"
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
                  className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs font-medium transition ${
                    customerType === "usuario"
                      ? "bg-orange-500/15 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.08)]"
                      : "text-zinc-500 hover:text-zinc-300"
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
                <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Empresa
                </label>

                <div className="relative">
                  <Building2
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                  />

                  <select
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                    required
                    className="h-11 w-full appearance-none rounded-xl border border-white/[0.08] bg-[#121215] pl-9 pr-3 text-xs font-medium text-white outline-none transition focus:border-orange-500/40 focus:bg-orange-500/[0.03]"
                  >
                    <option value="" className="bg-[#121215]">
                      Seleccionar empresa
                    </option>

                    {companies.map((company) => (
                      <option
                        key={company.id}
                        value={company.id}
                        className="bg-[#121215]"
                      >
                        {company.name_company}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCompany && discountPercentage > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                    Descuento aplicado: {discountPercentage}%
                  </div>
                )}
              </div>
            ) : (
              <div className="grid min-w-0 gap-4 sm:grid-cols-2">
                {/* NOMBRE */}
                <div className="min-w-0">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Cliente
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
                      placeholder="Nombre del cliente"
                      required
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121215] pl-9 pr-3 text-xs font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/40 focus:bg-orange-500/[0.03]"
                    />
                  </div>
                </div>

                {/* TELÉFONO */}
                <div className="min-w-0">
                  <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                    Teléfono
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
                      placeholder="300 123 4567"
                      required
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121215] pl-9 pr-3 text-xs font-medium text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/40 focus:bg-orange-500/[0.03]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FECHA */}
            <div className="min-w-0">
              <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Fecha de entrega
              </label>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121215] pl-9 pr-3 text-xs font-medium text-white outline-none transition focus:border-orange-500/40 focus:bg-orange-500/[0.03]"
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
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.3)] sm:rounded-3xl sm:p-6 lg:p-7">
              {/* HEADER */}
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Catálogo
                </p>

                <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar servicios..."
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121215] py-3 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/40 focus:bg-orange-500/[0.03] sm:h-12 sm:text-sm"
                />
              </div>

              {/* CATEGORÍAS */}
              <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId("")}
                  className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:px-5 sm:py-2.5 ${
                    selectedCategoryId === ""
                      ? "border border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.08)]"
                      : "border border-white/[0.08] bg-[#121215] text-zinc-500 hover:border-orange-500/20 hover:text-zinc-300"
                  }`}
                >
                  Todos
                </button>

                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(String(category.id))}
                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition sm:px-5 sm:py-2.5 ${
                      selectedCategoryId === String(category.id)
                        ? "border border-orange-500/30 bg-orange-500/15 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.08)]"
                        : "border border-white/[0.08] bg-[#121215] text-zinc-500 hover:border-orange-500/20 hover:text-zinc-300"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* SERVICIOS */}
              {filteredServices.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/[0.08] bg-[#121215] px-5 py-16 text-center">
                  <Package size={34} className="mx-auto text-zinc-700" />

                  <h3 className="mt-4 text-sm font-semibold text-white">
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
                        className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161618] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
                      >
                        {/* ICONO */}
                        <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-[#1d1d20] to-[#121215] sm:h-32">
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/10 bg-orange-500/[0.06] text-orange-400 transition duration-300 group-hover:scale-110 group-hover:bg-orange-500/10">
                            <Package size={30} />
                          </div>

                          {alreadyAdded && (
                            <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-400">
                              <Check size={14} />
                            </div>
                          )}
                        </div>

                        {/* INFO */}
                        <div className="p-4 sm:p-5">
                          <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                            {category?.name || "Servicio"}
                          </p>

                          <h3 className="min-h-[42px] text-sm font-semibold leading-5 text-white">
                            {service.name}
                          </h3>

                          <p className="mt-1 text-[11px] text-zinc-600">
                            Precio por {service.unit}
                          </p>

                          <div className="mt-5 flex items-end justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[10px] text-zinc-600">Desde</p>

                              <p className="truncate text-base font-bold text-white sm:text-lg">
                                {formatCurrency(Number(service.price))}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => addItem(service)}
                              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-semibold transition ${
                                alreadyAdded
                                  ? "border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/15"
                                  : "border border-orange-500/20 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
                              }`}
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
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:rounded-3xl">
              {/* HEADER */}
              <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/10 bg-orange-500/[0.06] text-orange-400 sm:h-11 sm:w-11">
                    <ShoppingCart size={20} />
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white sm:text-base">
                      Tu pedido
                    </h2>

                    <p className="text-[11px] text-zinc-500">
                      {items.length} servicio
                      {items.length !== 1 && "s"}
                    </p>
                  </div>
                </div>

                {items.length > 0 && (
                  <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 px-2 text-[11px] font-bold text-orange-300">
                    {items.length}
                  </span>
                )}
              </div>

              {/* VACÍO */}
              {items.length === 0 ? (
                <div className="px-5 py-14 text-center sm:py-16">
                  <ShoppingCart size={36} className="mx-auto text-zinc-700" />

                  <h3 className="mt-4 text-sm font-semibold text-white">
                    Tu carrito está vacío
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-zinc-500 sm:text-sm">
                    Agrega servicios desde el catálogo para comenzar.
                  </p>
                </div>
              ) : (
                <div className="max-h-[520px] divide-y divide-white/[0.05] overflow-y-auto">
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
                        className="p-4 transition hover:bg-white/[0.015] sm:p-5"
                      >
                        <div className="flex gap-3">
                          {/* ICONO */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-[#121215] text-orange-400 sm:h-11 sm:w-11">
                            <Package size={19} />
                          </div>

                          {/* INFO */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <h3 className="truncate text-xs font-semibold text-white sm:text-sm">
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
                              <div className="flex items-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#121215]">
                                <button
                                  type="button"
                                  onClick={() => changeQuantity(index, -1)}
                                  className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
                                >
                                  <Minus size={14} />
                                </button>

                                <span className="flex min-w-8 justify-center text-xs font-semibold text-white">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() => changeQuantity(index, 1)}
                                  className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>

                              <p className="text-sm font-bold text-orange-300">
                                {formatCurrency(itemSubtotal)}
                              </p>
                            </div>

                            {/* MEDIDAS */}
                            <div className="mt-3 flex flex-wrap gap-2">
                              {requiresDimensions &&
                                item.width &&
                                item.height && (
                                  <span className="rounded-lg border border-white/[0.05] bg-[#121215] px-2 py-1 text-[10px] text-zinc-500">
                                    {item.width} × {item.height} m
                                  </span>
                                )}

                              {requiresLength && item.width && (
                                <span className="rounded-lg border border-white/[0.05] bg-[#121215] px-2 py-1 text-[10px] text-zinc-500">
                                  {item.width} m
                                </span>
                              )}

                              {item.designFile && (
                                <span className="max-w-[150px] truncate rounded-lg border border-orange-500/10 bg-orange-500/[0.05] px-2 py-1 text-[10px] text-orange-300">
                                  📎 {item.designFile.name}
                                </span>
                              )}
                            </div>

                            {/* CONFIGURAR */}
                            <button
                              type="button"
                              onClick={() => setConfiguringIndex(index)}
                              className="mt-4 text-[11px] font-semibold text-orange-400 transition hover:text-orange-300"
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
                <div className="border-t border-white/[0.08] bg-[#161618] p-4 sm:p-5">
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Subtotal</span>

                      <span className="font-medium text-white">
                        {formatCurrency(subtotal)}
                      </span>
                    </div>

                    {discountPercentage > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Descuento ({discountPercentage}%)</span>

                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* TOTAL */}
                  <div className="mt-5 border-t border-white/[0.06] pt-5">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-xs font-medium text-zinc-500">
                        Total
                      </span>

                      <span className="text-xl font-bold text-orange-300 sm:text-2xl">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>

                  {/* CREAR */}
                  <button
                    type="submit"
                    disabled={submitting || items.length === 0}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-400/20 bg-orange-500/15 px-5 py-3.5 text-xs font-semibold text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.08)] transition hover:border-orange-400/30 hover:bg-orange-500/25 hover:shadow-[0_0_25px_rgba(249,115,22,0.12)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-500/15 sm:py-4"
                  >
                    {submitting ? "Creando pedido..." : "Crear pedido"}

                    {!submitting && <ChevronRight size={17} />}
                  </button>

                  {/* CANCELAR */}
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="mt-2 w-full rounded-xl py-3 text-xs font-medium text-zinc-600 transition hover:bg-white/[0.03] hover:text-white disabled:opacity-50"
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
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4 md:p-6">
            <div className="flex max-h-[94vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl border border-white/[0.08] bg-[#161618] shadow-[0_25px_70px_rgba(0,0,0,0.55)] sm:max-h-[90vh] sm:rounded-3xl">
              {/* HEADER */}
              <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#161618] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-500/10 bg-orange-500/[0.06] text-orange-400 sm:h-11 sm:w-11">
                    <Package size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-400">
                      Configurar servicio
                    </p>

                    <h2 className="truncate text-sm font-bold text-white sm:text-base">
                      {configuringService.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setConfiguringIndex(null)}
                  className="shrink-0 rounded-xl p-2 text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>

              {/* BODY */}
              <div className="overflow-y-auto p-4 sm:p-6">
                {/* PRECIO */}
                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-orange-500/10 bg-orange-500/[0.03] p-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Precio
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatCurrency(Number(configuringService.price))}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-lg border border-orange-500/10 bg-orange-500/[0.06] px-2.5 py-1.5 text-[10px] font-semibold text-orange-300">
                    Por {configuringService.unit}
                  </span>
                </div>

                {/* CANTIDAD */}
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    Cantidad
                  </label>

                  <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/[0.08] bg-[#121215]">
                    <button
                      type="button"
                      onClick={() => changeQuantity(configuringIndex, -1)}
                      className="flex h-11 w-11 items-center justify-center text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
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
                      className="h-11 w-16 bg-transparent text-center text-sm font-bold text-white outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => changeQuantity(configuringIndex, 1)}
                      className="flex h-11 w-11 items-center justify-center text-zinc-500 transition hover:bg-white/[0.04] hover:text-white"
                    >
                      <Plus size={17} />
                    </button>
                  </div>
                </div>

                {/* DIMENSIONES */}
                {(configuringService.unit === "m2" ||
                  configuringService.unit === "metro") && (
                  <div className="mb-5">
                    <label className="mb-2 block text-xs font-medium text-zinc-400">
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
                            className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121215] p-3 pr-10 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-orange-500/40"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
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
                              className="h-11 w-full rounded-xl border border-white/[0.08] bg-[#121215] p-3 pr-10 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-orange-500/40"
                            />

                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
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
                        <p className="mt-2 text-[11px] text-orange-400">
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
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
                    Archivo de diseño
                  </label>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-orange-500/20 bg-orange-500/[0.02] px-5 py-7 text-center transition hover:border-orange-500/40 hover:bg-orange-500/[0.04]">
                    <Upload size={23} className="text-orange-400" />

                    <span className="mt-2 text-xs font-medium text-white">
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
                      <span className="min-w-0 truncate text-[11px] text-orange-300">
                        📎 {configuringItem.designFile.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateItem(configuringIndex, "designFile", null)
                        }
                        className="shrink-0 text-[10px] text-red-400 hover:text-red-300"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </div>

                {/* OBSERVACIONES */}
                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">
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
                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#121215] p-3.5 text-xs text-white outline-none transition placeholder:text-zinc-700 focus:border-orange-500/40"
                  />
                </div>

                {/* SUBTOTAL */}
                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.04] p-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                      Subtotal del servicio
                    </p>

                    <p className="mt-1 text-xl font-bold text-orange-300">
                      {formatCurrency(configuringSubtotal)}
                    </p>
                  </div>

                  <Check size={22} className="shrink-0 text-orange-400" />
                </div>

                {/* GUARDAR */}
                <button
                  type="button"
                  onClick={() => setConfiguringIndex(null)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/20 bg-orange-500/15 px-5 py-3.5 text-xs font-semibold text-orange-200 transition hover:bg-orange-500/25"
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
