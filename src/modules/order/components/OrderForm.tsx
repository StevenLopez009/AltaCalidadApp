"use client";

import { useEffect, useMemo, useState } from "react";

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

export default function OrderForm() {
  // ============================================================
  // ESTADOS
  // ============================================================

  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [companyId, setCompanyId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Categoría seleccionada en el catálogo
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Servicios agregados al pedido
  const [items, setItems] = useState<OrderItemForm[]>([]);

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

  const discountPercentage = Number(selectedCompany?.discount_percentage) || 0;

  // ============================================================
  // OBTENER SERVICIO
  // ============================================================

  function getSelectedService(item: OrderItemForm) {
    return services.find((service) => service.id === Number(item.serviceId));
  }

  // ============================================================
  // AGREGAR SERVICIO
  // ============================================================

  function addItem(service: Service) {
    const alreadyExists = items.some(
      (item) => Number(item.serviceId) === service.id,
    );

    if (alreadyExists) {
      alert("Este servicio ya está agregado al pedido.");
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
  // ELIMINAR ITEM
  // ============================================================

  function removeItem(index: number) {
    setItems((currentItems) =>
      currentItems.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  // ============================================================
  // SERVICIOS POR CATEGORÍA
  // ============================================================

  function getServicesByCategory(categoryId: string) {
    return services.filter(
      (service) => service.category_id === Number(categoryId),
    );
  }

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

      // ========================================================
      // M2
      // ========================================================

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

          return false;
        }
      }

      // ========================================================
      // METRO
      // ========================================================

      if (service.unit === "metro") {
        const width = Number(item.width);

        if (!item.width || !Number.isFinite(width) || width <= 0) {
          alert(`Debe ingresar una longitud válida para ${service.name}.`);

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

    // Empresa
    if (!companyId) {
      alert("Seleccione una empresa.");
      return;
    }

    // Fecha
    if (!deliveryDate) {
      alert("Seleccione la fecha de entrega.");
      return;
    }

    // Items
    if (!validateItems()) {
      return;
    }

    if (!Number.isFinite(subtotal) || subtotal < 0) {
      alert("El subtotal del pedido no es válido.");
      return;
    }

    try {
      setSubmitting(true);

      // ========================================================
      // PREPARAR ITEMS
      // ========================================================

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

      // ========================================================
      // FORMDATA
      // ========================================================

      const formData = new FormData();

      formData.append("companyId", companyId);
      formData.append("deliveryDate", deliveryDate);

      formData.append("subtotal", String(subtotal));

      formData.append("discountPercentage", String(discountPercentage));

      formData.append("discountAmount", String(discountAmount));

      formData.append("total", String(total));

      formData.append("items", JSON.stringify(orderItems));

      // ========================================================
      // ARCHIVOS
      // ========================================================

      items.forEach((item, index) => {
        if (item.designFile) {
          formData.append(`designFile_${index}`, item.designFile);
        }
      });

      // ========================================================
      // REQUEST
      // ========================================================

      const response = await fetch("/api/orders", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error creando pedido");
      }

      console.log("Pedido creado:", data);

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
    setCompanyId("");
    setDeliveryDate("");
    setSelectedCategoryId("");
    setItems([]);
  }

  // ============================================================
  // SERVICIOS DEL CATÁLOGO
  // ============================================================

  const categoryServices = selectedCategoryId
    ? getServicesByCategory(selectedCategoryId)
    : [];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-7xl rounded-3xl border border-purple-500/20 bg-[#161325] p-8 shadow-xl md:p-10"
    >
      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Crear Pedido</h1>

        <p className="mt-2 text-sm text-gray-400">
          Selecciona los servicios que deseas agregar a la orden.
        </p>
      </div>

      {/* ======================================================
          INFORMACIÓN GENERAL
      ======================================================= */}

      <section className="mb-10">
        <h2 className="mb-5 text-xl font-semibold text-white">
          Información del pedido
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* EMPRESA */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Empresa / Cliente
            </label>

            <select
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              required
              className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white outline-none focus:border-purple-500"
            >
              <option value="">Seleccione una empresa</option>

              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name_company}
                </option>
              ))}
            </select>

            {selectedCompany && (
              <p className="mt-2 text-sm text-purple-300">
                Descuento aplicado: {discountPercentage}%
              </p>
            )}
          </div>

          {/* FECHA */}

          <div>
            <label className="mb-2 block text-sm text-gray-300">
              Fecha de entrega
            </label>

            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              required
              className="w-full rounded-xl border border-purple-500/20 bg-[#211B3A] p-3 text-white outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          CATÁLOGO
      ======================================================= */}

      <section className="mb-10">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-white">
            Catálogo de servicios
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            Selecciona una categoría y agrega los servicios que necesites.
          </p>
        </div>

        {/* CATEGORÍAS */}

        <div className="mb-6 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategoryId(String(category.id))}
              className={`rounded-xl px-5 py-3 text-sm font-semibold transition ${
                selectedCategoryId === String(category.id)
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30"
                  : "border border-purple-500/20 bg-[#211B3A] text-gray-300 hover:border-purple-500/40 hover:bg-purple-500/10"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* SERVICIOS */}

        {!selectedCategoryId ? (
          <div className="rounded-2xl border border-dashed border-purple-500/20 bg-[#211B3A] p-10 text-center">
            <p className="text-gray-400">
              Selecciona una categoría para comenzar.
            </p>
          </div>
        ) : categoryServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-purple-500/20 bg-[#211B3A] p-10 text-center">
            <p className="text-gray-400">Esta categoría no tiene servicios.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categoryServices.map((service) => {
              const alreadyAdded = items.some(
                (item) => Number(item.serviceId) === service.id,
              );

              return (
                <div
                  key={service.id}
                  className={`group rounded-2xl border bg-[#211B3A] p-5 transition ${
                    alreadyAdded
                      ? "border-purple-500/40 opacity-70"
                      : "border-purple-500/20 hover:-translate-y-1 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-950/20"
                  }`}
                >
                  {/* ICONO */}

                  <div className="mb-5 flex h-28 items-center justify-center rounded-xl bg-[#161325]">
                    <div className="text-4xl">🖨️</div>
                  </div>

                  {/* NOMBRE */}

                  <h3 className="font-semibold text-white">{service.name}</h3>

                  {/* UNIDAD */}

                  <p className="mt-1 text-sm text-gray-500">
                    Venta por {service.unit}
                  </p>

                  {/* PRECIO */}

                  <p className="mt-4 text-xl font-bold text-purple-400">
                    {formatCurrency(Number(service.price))}
                  </p>

                  {/* BOTÓN */}

                  <button
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => addItem(service)}
                    className="mt-5 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
                  >
                    {alreadyAdded ? "✓ Agregado" : "+ Agregar al pedido"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ======================================================
          SERVICIOS DEL PEDIDO
      ======================================================= */}

      {items.length > 0 && (
        <section className="mb-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-white">
              Servicios del pedido
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Configura las cantidades y especificaciones de cada servicio.
            </p>
          </div>

          <div className="space-y-5">
            {items.map((item, index) => {
              const selectedService = getSelectedService(item);

              const requiresDimensions = selectedService?.unit === "m2";

              const requiresLength = selectedService?.unit === "metro";

              const itemSubtotal = calculateItemSubtotal(item);

              return (
                <div
                  key={`${item.serviceId}-${index}`}
                  className="overflow-hidden rounded-2xl border border-purple-500/20 bg-[#211B3A]"
                >
                  {/* ==================================================
                      HEADER CARD
                  ================================================== */}

                  <div className="flex items-center justify-between border-b border-purple-500/10 bg-[#261F40] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600/20 text-sm font-bold text-purple-400">
                        {index + 1}
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">
                          {selectedService?.name}
                        </h3>

                        <p className="text-xs text-gray-500">
                          {selectedService
                            ? `Precio ${formatCurrency(
                                Number(selectedService.price),
                              )} / ${selectedService.unit}`
                            : "Servicio"}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* ==================================================
                      CONTENIDO
                  ================================================== */}

                  <div className="p-6">
                    {/* INFORMACIÓN DEL SERVICIO */}

                    <div className="mb-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-purple-500/10 bg-[#161325] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Categoría
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {
                            categories.find(
                              (category) =>
                                category.id === Number(item.categoryId),
                            )?.name
                          }
                        </p>
                      </div>

                      <div className="rounded-xl border border-purple-500/10 bg-[#161325] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Servicio
                        </p>

                        <p className="mt-1 font-semibold text-white">
                          {selectedService?.name}
                        </p>
                      </div>

                      <div className="rounded-xl border border-purple-500/10 bg-[#161325] p-4">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Unidad
                        </p>

                        <p className="mt-1 font-semibold text-purple-400">
                          {selectedService?.unit}
                        </p>
                      </div>
                    </div>

                    {/* CAMPOS */}

                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                      {/* CANTIDAD */}

                      <div>
                        <label className="mb-2 block text-sm text-gray-300">
                          Cantidad
                        </label>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-purple-500/20 bg-[#161325] p-3 text-white outline-none focus:border-purple-500"
                        />
                      </div>

                      {/* BASE / LONGITUD */}

                      {(requiresDimensions || requiresLength) && (
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">
                            {requiresDimensions ? "Base" : "Longitud"}
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.width}
                            onChange={(e) =>
                              updateItem(index, "width", e.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-purple-500/20 bg-[#161325] p-3 text-white outline-none focus:border-purple-500"
                          />
                        </div>
                      )}

                      {/* ALTURA */}

                      {requiresDimensions && (
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">
                            Altura
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.height}
                            onChange={(e) =>
                              updateItem(index, "height", e.target.value)
                            }
                            required
                            className="w-full rounded-xl border border-purple-500/20 bg-[#161325] p-3 text-white outline-none focus:border-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                        PRECIO
                    ================================================== */}

                    {selectedService && (
                      <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-purple-500/10 bg-[#161325] p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Precio unitario
                          </p>

                          <p className="mt-1 text-lg font-semibold text-white">
                            {formatCurrency(Number(selectedService.price))}
                          </p>

                          <p className="text-xs text-gray-500">
                            por {selectedService.unit}
                          </p>
                        </div>

                        <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Subtotal
                          </p>

                          <p className="mt-1 text-2xl font-bold text-purple-400">
                            {formatCurrency(itemSubtotal)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ==================================================
                        ARCHIVO
                    ================================================== */}

                    <div className="mt-6">
                      <label className="mb-2 block text-sm text-gray-300">
                        Archivo de diseño
                      </label>

                      <input
                        type="file"
                        accept=".pdf,.ai,.cdr,.svg,.png,.jpg,.jpeg"
                        onChange={(e) =>
                          updateItem(
                            index,
                            "designFile",
                            e.target.files?.[0] ?? null,
                          )
                        }
                        className="w-full rounded-xl border border-purple-500/20 bg-[#161325] p-3 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white hover:file:bg-purple-700"
                      />

                      {item.designFile && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-purple-300">
                          <span>📎</span>

                          <span>{item.designFile.name}</span>
                        </div>
                      )}
                    </div>

                    {/* ==================================================
                        OBSERVACIONES
                    ================================================== */}

                    <div className="mt-6">
                      <label className="mb-2 block text-sm text-gray-300">
                        Observaciones
                      </label>

                      <textarea
                        rows={3}
                        value={item.observations}
                        onChange={(e) =>
                          updateItem(index, "observations", e.target.value)
                        }
                        placeholder="Especificaciones de este servicio..."
                        className="w-full rounded-xl border border-purple-500/20 bg-[#161325] p-3 text-white outline-none placeholder:text-gray-600 focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ======================================================
          RESUMEN
      ======================================================= */}

      <section className="mb-8 rounded-2xl border border-purple-500/20 bg-[#211B3A] p-6">
        <h2 className="mb-6 text-xl font-semibold text-white">
          Resumen del pedido
        </h2>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Servicios ({items.length})</span>

            <span>{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between text-gray-300">
            <span>Descuento ({discountPercentage}%)</span>

            <span className="text-red-400">
              - {formatCurrency(discountAmount)}
            </span>
          </div>

          <div className="border-t border-purple-500/20 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-white">Total</span>

              <span className="text-3xl font-bold text-purple-400">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          ACTIONS
      ======================================================= */}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={resetForm}
          disabled={submitting}
          className="rounded-xl border border-gray-600 px-6 py-3 text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-3 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {submitting ? "Creando pedido..." : "Crear Pedido"}
        </button>
      </div>
    </form>
  );
}
