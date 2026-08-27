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
  // ============================================================
  // DATOS
  // ============================================================

  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // ============================================================
  // CLIENTE
  // ============================================================

  const [customerType, setCustomerType] = useState<CustomerType>("empresa");

  const [companyId, setCompanyId] = useState("");

  const [customerName, setCustomerName] = useState("");

  const [customerPhone, setCustomerPhone] = useState("");

  const [deliveryDate, setDeliveryDate] = useState("");

  // ============================================================
  // CATÁLOGO
  // ============================================================

  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [search, setSearch] = useState("");

  // ============================================================
  // CARRITO
  // ============================================================

  const [items, setItems] = useState<OrderItemForm[]>([]);

  const [configuringIndex, setConfiguringIndex] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // ============================================================
  // CARGAR DATOS
  // ============================================================

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

  // ============================================================
  // EMPRESA SELECCIONADA
  // ============================================================

  const selectedCompany = companies.find(
    (company) => company.id === Number(companyId),
  );

  // ============================================================
  // DESCUENTO
  // ============================================================

  const discountPercentage =
    customerType === "empresa"
      ? Number(selectedCompany?.discount_percentage) || 0
      : 0;

  // ============================================================
  // SERVICIO DE UN ITEM
  // ============================================================

  function getSelectedService(item: OrderItemForm) {
    return services.find((service) => service.id === Number(item.serviceId));
  }

  // ============================================================
  // AGREGAR SERVICIO
  // ============================================================

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

  // ============================================================
  // ACTUALIZAR ITEM
  // ============================================================

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
    <form onSubmit={handleSubmit} className="mx-auto max-w-[1500px]">
      {/* ======================================================
          HEADER
      ======================================================= */}

      {/* ======================================================
          INFORMACIÓN DEL CLIENTE
      ======================================================= */}

      <section className="mb-6 rounded-2xl border border-white/5 bg-[#1b1730] p-4 md:p-5">
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Información del cliente
            </h2>

            <p className="mt-0.5 text-xs text-gray-500">
              Datos del pedido y entrega
            </p>
          </div>

          <User size={18} className="text-gray-600" />
        </div>

        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
          {/* TIPO DE CLIENTE */}
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Tipo
            </label>

            <div className="flex rounded-xl border border-white/5 bg-[#161325] p-1">
              <button
                type="button"
                onClick={() => {
                  setCustomerType("empresa");
                  setCustomerName("");
                  setCustomerPhone("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  customerType === "empresa"
                    ? "bg-purple-600/90 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Building2 size={14} />
                Empresa
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomerType("usuario");
                  setCompanyId("");
                }}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  customerType === "usuario"
                    ? "bg-purple-600/90 text-white"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <User size={14} />
                Usuario
              </button>
            </div>
          </div>

          {/* SEGUNDA COLUMNA */}
          {customerType === "empresa" ? (
            /* EMPRESA */
            <div>
              <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                Empresa
              </label>

              <div className="relative">
                <Building2
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                  className="h-10 w-full appearance-none rounded-xl border border-white/5 bg-[#161325] pl-9 pr-3 text-xs font-medium text-white outline-none transition focus:border-purple-500/40"
                >
                  <option value="" className="bg-[#161325]">
                    Seleccionar empresa
                  </option>

                  {companies.map((company) => (
                    <option
                      key={company.id}
                      value={company.id}
                      className="bg-[#161325]"
                    >
                      {company.name_company}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCompany && discountPercentage > 0 && (
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Descuento {discountPercentage}%
                </div>
              )}
            </div>
          ) : (
            /* USUARIO: DIVIDIDO EN 2 */
            <div className="grid min-w-0 grid-cols-2 gap-3">
              {/* NOMBRE */}
              <div className="min-w-0">
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Cliente
                </label>

                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nombre del cliente"
                    required
                    className="h-10 w-full rounded-xl border border-white/5 bg-[#161325] pl-9 pr-3 text-xs font-medium text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/40"
                  />
                </div>
              </div>

              {/* TELÉFONO */}
              <div className="min-w-0">
                <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
                  Teléfono
                </label>

                <div className="relative">
                  <Phone
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                  />

                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="300 123 4567"
                    required
                    className="h-10 w-full rounded-xl border border-white/5 bg-[#161325] pl-9 pr-3 text-xs font-medium text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* FECHA */}
          <div className="min-w-0">
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Entrega
            </label>

            <div className="relative">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              />

              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-white/5 bg-[#161325] pl-9 pr-3 text-xs font-medium text-white outline-none transition focus:border-purple-500/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENIDO PRINCIPAL
      ======================================================= */}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ====================================================
            CATÁLOGO
        ===================================================== */}

        <section className="min-w-0">
          <div className="rounded-3xl border border-white/10 bg-[#161325] p-5 md:p-7">
            {/* TITULO */}

            <div className="mb-6">
              <p className="text-sm font-medium text-purple-400">Catálogo</p>

              <h2 className="mt-1 text-2xl font-bold text-white">
                Selecciona tus servicios
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Busca y agrega los servicios que necesitas.
              </p>
            </div>

            {/* BUSCADOR */}

            <div className="relative mb-6">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar servicios..."
                className="w-full rounded-2xl border border-white/10 bg-[#211B3A] py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
              />
            </div>

            {/* CATEGORIAS */}

            <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryId("")}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  selectedCategoryId === ""
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-950/30"
                    : "border border-white/10 bg-[#211B3A] text-gray-400 hover:border-purple-500/30 hover:text-white"
                }`}
              >
                Todos
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(String(category.id))}
                  className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                    selectedCategoryId === String(category.id)
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-950/30"
                      : "border border-white/10 bg-[#211B3A] text-gray-400 hover:border-purple-500/30 hover:text-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {/* PRODUCTOS */}

            {filteredServices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#211B3A] px-6 py-16 text-center">
                <Package size={35} className="mx-auto text-gray-600" />

                <h3 className="mt-4 font-semibold text-white">
                  No encontramos servicios
                </h3>

                <p className="mt-2 text-sm text-gray-500">
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
                      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#211B3A] transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-950/20"
                    >
                      {/* ICONO */}

                      <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-[#2B2147] to-[#181429]">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-purple-500/10 bg-purple-500/10 text-purple-400 transition duration-300 group-hover:scale-110">
                          <Package size={36} />
                        </div>

                        {alreadyAdded && (
                          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                            <Check size={16} />
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div className="p-5">
                        <p className="mb-1 truncate text-[11px] font-semibold uppercase tracking-wider text-purple-400">
                          {category?.name || "Servicio"}
                        </p>

                        <h3 className="min-h-[48px] text-base font-semibold text-white">
                          {service.name}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Precio por {service.unit}
                        </p>

                        <div className="mt-5 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[11px] text-gray-500">Desde</p>

                            <p className="text-lg font-bold text-white">
                              {formatCurrency(Number(service.price))}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => addItem(service)}
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                              alreadyAdded
                                ? "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                : "bg-purple-600 text-white hover:bg-purple-500"
                            }`}
                          >
                            {alreadyAdded ? (
                              <>
                                <Check size={15} />
                                Ver
                              </>
                            ) : (
                              <>
                                <Plus size={15} />
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
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#211B3A] shadow-2xl shadow-black/20">
            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <ShoppingCart size={21} />
                </div>

                <div>
                  <h2 className="font-bold text-white">Tu pedido</h2>

                  <p className="text-xs text-gray-500">
                    {items.length} producto
                    {items.length !== 1 && "s"}
                  </p>
                </div>
              </div>

              {items.length > 0 && (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-purple-600 px-2 text-xs font-bold text-white">
                  {items.length}
                </span>
              )}
            </div>

            {/* ITEMS */}

            {items.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <ShoppingCart size={38} className="mx-auto text-gray-700" />

                <h3 className="mt-4 font-semibold text-white">
                  Tu carrito está vacío
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Agrega servicios desde el catálogo para comenzar.
                </p>
              </div>
            ) : (
              <div className="max-h-[500px] divide-y divide-white/5 overflow-y-auto">
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
                      className="p-5 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex gap-3">
                        {/* ICONO */}

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#161325] text-purple-400">
                          <Package size={22} />
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-white">
                                {service.name}
                              </h3>

                              <p className="mt-1 text-xs text-gray-500">
                                {formatCurrency(Number(service.price))} /{" "}
                                {service.unit}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="shrink-0 rounded-lg p-1.5 text-gray-600 transition hover:bg-red-500/10 hover:text-red-400"
                              title="Eliminar servicio"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          {/* CANTIDAD */}

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center rounded-xl border border-white/10 bg-[#161325]">
                              <button
                                type="button"
                                onClick={() => changeQuantity(index, -1)}
                                className="flex h-9 w-9 items-center justify-center text-gray-400 transition hover:text-white"
                              >
                                <Minus size={15} />
                              </button>

                              <span className="flex min-w-9 justify-center text-sm font-semibold text-white">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() => changeQuantity(index, 1)}
                                className="flex h-9 w-9 items-center justify-center text-gray-400 transition hover:text-white"
                              >
                                <Plus size={15} />
                              </button>
                            </div>

                            <p className="text-base font-bold text-white">
                              {formatCurrency(itemSubtotal)}
                            </p>
                          </div>

                          {/* MEDIDAS */}

                          <div className="mt-3 flex flex-wrap gap-2">
                            {requiresDimensions &&
                              item.width &&
                              item.height && (
                                <span className="rounded-lg bg-[#161325] px-2.5 py-1 text-[11px] text-gray-400">
                                  {item.width} × {item.height} m
                                </span>
                              )}

                            {requiresLength && item.width && (
                              <span className="rounded-lg bg-[#161325] px-2.5 py-1 text-[11px] text-gray-400">
                                {item.width} m
                              </span>
                            )}

                            {item.designFile && (
                              <span className="max-w-[150px] truncate rounded-lg bg-purple-500/10 px-2.5 py-1 text-[11px] text-purple-300">
                                📎 {item.designFile.name}
                              </span>
                            )}
                          </div>

                          {/* CONFIGURAR */}

                          <button
                            type="button"
                            onClick={() => setConfiguringIndex(index)}
                            className="mt-4 text-xs font-semibold text-purple-400 transition hover:text-purple-300"
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
              <div className="border-t border-white/10 bg-[#1C1830] p-5">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>

                    <span className="text-white">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>
                        Descuento ({discountPercentage}
                        %)
                      </span>

                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-white/10 pt-5">
                  <div className="flex items-end justify-between">
                    <span className="font-medium text-gray-400">Total</span>

                    <span className="text-2xl font-bold text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || items.length === 0}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-4 font-semibold text-white shadow-lg shadow-purple-950/30 transition hover:scale-[1.02] hover:shadow-purple-950/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {submitting ? "Creando pedido..." : "Crear pedido"}

                  {!submitting && <ChevronRight size={19} />}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl py-3 text-sm font-medium text-gray-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-6">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-white/10 bg-[#211B3A] shadow-2xl md:rounded-3xl">
            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#211B3A] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Package size={21} />
                </div>

                <div>
                  <p className="text-xs text-purple-400">Configurar servicio</p>

                  <h2 className="font-bold text-white">
                    {configuringService.name}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfiguringIndex(null)}
                className="rounded-xl p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* PRECIO */}

              <div className="mb-6 flex items-center justify-between rounded-2xl border border-purple-500/10 bg-[#161325] p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Precio
                  </p>

                  <p className="mt-1 font-semibold text-white">
                    {formatCurrency(Number(configuringService.price))}
                  </p>
                </div>

                <span className="rounded-lg bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-400">
                  Por {configuringService.unit}
                </span>
              </div>

              {/* CANTIDAD */}

              <div className="mb-6">
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Cantidad
                </label>

                <div className="flex w-fit items-center overflow-hidden rounded-xl border border-white/10 bg-[#161325]">
                  <button
                    type="button"
                    onClick={() => changeQuantity(configuringIndex, -1)}
                    className="flex h-12 w-12 items-center justify-center text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <Minus size={18} />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={configuringItem.quantity}
                    onChange={(e) =>
                      updateItem(configuringIndex, "quantity", e.target.value)
                    }
                    className="h-12 w-20 bg-transparent text-center font-bold text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => changeQuantity(configuringIndex, 1)}
                    className="flex h-12 w-12 items-center justify-center text-gray-400 transition hover:bg-white/5 hover:text-white"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* DIMENSIONES */}

              {(configuringService.unit === "m2" ||
                configuringService.unit === "metro") && (
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-medium text-gray-300">
                    Dimensiones
                  </label>

                  <div
                    className={`grid gap-4 ${
                      configuringService.unit === "m2"
                        ? "sm:grid-cols-2"
                        : "sm:grid-cols-1"
                    }`}
                  >
                    {/* ANCHO */}

                    <div>
                      <label className="mb-2 block text-xs text-gray-500">
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
                          className="w-full rounded-xl border border-white/10 bg-[#161325] p-3.5 pr-12 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          m
                        </span>
                      </div>
                    </div>

                    {/* ALTO */}

                    {configuringService.unit === "m2" && (
                      <div>
                        <label className="mb-2 block text-xs text-gray-500">
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
                            className="w-full rounded-xl border border-white/10 bg-[#161325] p-3.5 pr-12 text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                          />

                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
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
                      <p className="mt-3 text-xs text-purple-400">
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
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Archivo de diseño
                </label>

                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-purple-500/30 bg-purple-500/[0.03] px-6 py-8 text-center transition hover:border-purple-500/60 hover:bg-purple-500/[0.06]">
                  <Upload size={25} className="text-purple-400" />

                  <span className="mt-3 text-sm font-medium text-white">
                    Seleccionar archivo
                  </span>

                  <span className="mt-1 text-xs text-gray-500">
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
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
                    <span className="max-w-[80%] truncate text-sm text-purple-300">
                      📎 {configuringItem.designFile.name}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateItem(configuringIndex, "designFile", null)
                      }
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* OBSERVACIONES */}

              <div>
                <label className="mb-3 block text-sm font-medium text-gray-300">
                  Observaciones
                </label>

                <textarea
                  rows={4}
                  value={configuringItem.observations}
                  onChange={(e) =>
                    updateItem(configuringIndex, "observations", e.target.value)
                  }
                  placeholder="Agrega especificaciones o instrucciones para este servicio..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#161325] p-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-purple-500"
                />
              </div>

              {/* SUBTOTAL */}

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Subtotal del servicio
                  </p>

                  <p className="mt-1 text-2xl font-bold text-purple-400">
                    {formatCurrency(configuringSubtotal)}
                  </p>
                </div>

                <Check size={24} className="text-purple-400" />
              </div>

              {/* GUARDAR */}

              <button
                type="button"
                onClick={() => setConfiguringIndex(null)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-4 font-semibold text-white transition hover:bg-purple-500"
              >
                <Check size={19} />
                Guardar configuración
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
