"use client";

import { useCallback, useEffect, useState } from "react";

import { Banknote, Pencil, Plus, Receipt, Trash2, X } from "lucide-react";

const ACCENT = "#FFD21C";

type ExpenseCategory =
  | "arriendo"
  | "servicios"
  | "nomina"
  | "materiales"
  | "transporte"
  | "mantenimiento"
  | "impuestos"
  | "otros";

type PaymentMethod = "efectivo" | "digital";

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: "arriendo", label: "Arriendo" },
  { value: "servicios", label: "Servicios" },
  { value: "nomina", label: "Nómina" },
  { value: "materiales", label: "Materiales" },
  { value: "transporte", label: "Transporte" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "impuestos", label: "Impuestos" },
  { value: "otros", label: "Otros" },
];

const CATEGORY_LABELS = Object.fromEntries(
  CATEGORIES.map((item) => [item.value, item.label]),
) as Record<ExpenseCategory, string>;

interface Expense {
  id: number;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  spentAt: string;
  notes: string | null;
}

interface ExpensesReport {
  range: { from: string; to: string; category: ExpenseCategory | null };
  summary: {
    total: number;
    count: number;
    cash: number;
    digital: number;
    average: number;
  };
  byCategory: {
    category: ExpenseCategory;
    total: number;
    count: number;
    share: number;
  }[];
  monthly: { month: string; total: number; count: number }[];
  expenses: Expense[];
}

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function currentMonthRange() {
  const today = new Date();

  return {
    from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toISODate(today),
  };
}

function monthRange(offset: number) {
  const today = new Date();

  const start = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  const end = new Date(today.getFullYear(), today.getMonth() - offset + 1, 0);

  return { from: toISODate(start), to: toISODate(end) };
}

function yearRange() {
  const today = new Date();

  return {
    from: toISODate(new Date(today.getFullYear(), 0, 1)),
    to: toISODate(today),
  };
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonth(value: string) {
  const [year, month] = value.split("-");

  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

const EMPTY_FORM = {
  description: "",
  amount: "",
  category: "otros" as ExpenseCategory,
  payment_method: "efectivo" as PaymentMethod,
  spent_at: toISODate(new Date()),
  notes: "",
};

export default function ExpensesControl() {
  const [range, setRange] = useState(currentMonthRange);
  const [category, setCategory] = useState<ExpenseCategory | "todas">("todas");

  const [report, setReport] = useState<ExpensesReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
        category,
      });

      const response = await fetch(`/api/expenses?${params.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudieron cargar los gastos");
      }

      setReport(data);
    } catch (requestError) {
      console.error("Error obteniendo gastos:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudieron cargar los gastos",
      );

      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to, category]);

  // El reporte depende del rango y la categoría elegidos, así que se recarga
  // cuando cambian. El estado de carga es parte de esa sincronización.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReport();
  }, [loadReport]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, spent_at: toISODate(new Date()) });
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditingId(expense.id);

    setForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category,
      payment_method: expense.paymentMethod,
      spent_at: expense.spentAt,
      notes: expense.notes ?? "",
    });

    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setSaving(true);

      const endpoint = editingId
        ? `/api/expenses/${editingId}`
        : "/api/expenses";

      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description,
          amount: Number(form.amount),
          category: form.category,
          payment_method: form.payment_method,
          spent_at: form.spent_at,
          notes: form.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "No se pudo guardar el gasto");
        return;
      }

      closeForm();
      await loadReport();
    } catch (submitError) {
      console.error("Error guardando el gasto:", submitError);

      alert("Error guardando el gasto");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(expense: Expense) {
    const confirmed = window.confirm(
      `¿Eliminar el gasto "${expense.description}" por ${formatMoney(expense.amount)}? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(expense.id);

      const response = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message ?? "No se pudo eliminar el gasto");
        return;
      }

      await loadReport();
    } catch (deleteError) {
      console.error("Error eliminando el gasto:", deleteError);

      alert("Error eliminando el gasto");
    } finally {
      setDeletingId(null);
    }
  }

  function applyPreset(preset: "mes" | "anterior" | "año") {
    if (preset === "mes") setRange(currentMonthRange());
    if (preset === "anterior") setRange(monthRange(1));
    if (preset === "año") setRange(yearRange());
  }

  const summary = report?.summary;

  return (
    <div className="text-[#f7f4ed]">
      {/* ENCABEZADO */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Control de gastos
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Gastos operativos del negocio, aparte del costo de material
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-[#FFD21C] px-3 py-2 text-[11px] font-bold text-[#111] transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Registrar gasto
        </button>
      </div>

      {/* FILTROS */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
          {(
            [
              { value: "mes", label: "Este mes" },
              { value: "anterior", label: "Mes anterior" },
              { value: "año", label: "Este año" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => applyPreset(item.value)}
              className="rounded-lg px-3 py-1.5 text-[11px] font-semibold text-zinc-400 transition hover:text-white"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(event) =>
              setRange((current) => ({ ...current, from: event.target.value }))
            }
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] text-zinc-300 outline-none focus:border-[#FFD21C]/40 [color-scheme:dark]"
          />

          <span className="text-[11px] text-zinc-600">a</span>

          <input
            type="date"
            value={range.to}
            min={range.from}
            onChange={(event) =>
              setRange((current) => ({ ...current, to: event.target.value }))
            }
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] text-zinc-300 outline-none focus:border-[#FFD21C]/40 [color-scheme:dark]"
          />
        </div>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as ExpenseCategory | "todas")
          }
          className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] font-semibold text-zinc-300 outline-none focus:border-[#FFD21C]/40 [color-scheme:dark]"
        >
          <option value="todas">Todas las categorías</option>

          {CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-[#FF3030]/30 bg-[#FF3030]/10 px-4 py-3 text-xs text-[#ff8f8f]">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#FF3030]/[0.12] to-transparent p-5">
          <div className="mb-3 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#ff8f8f]" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Total gastado
            </span>
          </div>

          <p className="text-4xl font-bold tracking-tight text-[#f7f4ed]">
            {loading ? "—" : formatMoney(summary?.total ?? 0)}
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            {summary?.count ?? 0} {summary?.count === 1 ? "gasto" : "gastos"} ·
            promedio {formatMoney(summary?.average ?? 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-zinc-500" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Efectivo
            </span>
          </div>

          <p className="text-2xl font-bold tracking-tight text-[#f7f4ed]">
            {loading ? "—" : formatMoney(summary?.cash ?? 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Banknote className="h-4 w-4 text-zinc-500" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Digital
            </span>
          </div>

          <p className="text-2xl font-bold tracking-tight text-[#f7f4ed]">
            {loading ? "—" : formatMoney(summary?.digital ?? 0)}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ACCENT }}
            />

            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Mayor categoría
            </span>
          </div>

          <p className="text-2xl font-bold tracking-tight text-[#f7f4ed]">
            {loading || !report?.byCategory.length
              ? "—"
              : CATEGORY_LABELS[report.byCategory[0].category]}
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            {report?.byCategory.length
              ? `${formatMoney(report.byCategory[0].total)} · ${Math.round(report.byCategory[0].share)}% del total`
              : "Sin gastos en el rango"}
          </p>
        </div>
      </div>

      {/* DESGLOSE POR CATEGORÍA */}
      {!loading && (report?.byCategory.length ?? 0) > 0 && (
        <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#f7f4ed]">
            Por categoría
          </h3>

          <div className="space-y-2.5">
            {report?.byCategory.map((row) => (
              <div key={row.category}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">
                    {CATEGORY_LABELS[row.category]}
                  </span>

                  <span className="font-semibold text-[#f7f4ed]">
                    {formatMoney(row.total)}{" "}
                    <span className="font-normal text-zinc-600">
                      ({Math.round(row.share)}%)
                    </span>
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.share}%`,
                      backgroundColor: ACCENT,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESUMEN MENSUAL */}
      {!loading && (report?.monthly.length ?? 0) > 1 && (
        <div className="mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#f7f4ed]">
            Por mes
          </h3>

          <div className="space-y-1.5">
            {report?.monthly.map((row) => (
              <div
                key={row.month}
                className="flex items-center justify-between border-b border-white/[0.04] pb-1.5 text-xs last:border-0"
              >
                <span className="capitalize text-zinc-400">
                  {formatMonth(row.month)}
                </span>

                <span className="font-semibold text-[#f7f4ed]">
                  {formatMoney(row.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LISTA */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <h3 className="mb-4 text-sm font-semibold text-[#f7f4ed]">
          Gastos registrados
        </h3>

        {loading ? (
          <p className="py-8 text-center text-xs text-zinc-600">Cargando...</p>
        ) : (report?.expenses.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center gap-1 py-10">
            <p className="text-sm text-zinc-500">No hay gastos en este rango</p>

            <p className="text-xs text-zinc-600">
              Usa &quot;Registrar gasto&quot; para agregar el primero
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-wider text-zinc-600">
                  <th className="pb-2 font-medium">Fecha</th>
                  <th className="pb-2 font-medium">Descripción</th>
                  <th className="pb-2 font-medium">Categoría</th>
                  <th className="pb-2 font-medium">Método</th>
                  <th className="pb-2 text-right font-medium">Monto</th>
                  <th className="pb-2 text-right font-medium">Acciones</th>
                </tr>
              </thead>

              <tbody className="text-xs">
                {report?.expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-white/[0.04] last:border-0"
                  >
                    <td className="py-2.5 text-zinc-500">
                      {formatDate(expense.spentAt)}
                    </td>

                    <td className="py-2.5 text-zinc-300">
                      {expense.description}

                      {expense.notes && (
                        <span className="block text-[10px] text-zinc-600">
                          {expense.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 text-zinc-400">
                      {CATEGORY_LABELS[expense.category]}
                    </td>

                    <td className="py-2.5 text-zinc-400">
                      {expense.paymentMethod === "efectivo"
                        ? "Efectivo"
                        : "Digital"}
                    </td>

                    <td className="py-2.5 text-right font-semibold text-[#f7f4ed]">
                      {formatMoney(expense.amount)}
                    </td>

                    <td className="py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(expense)}
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:text-[#FFD21C]"
                          aria-label={`Editar ${expense.description}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(expense)}
                          disabled={deletingId === expense.id}
                          className="rounded-lg p-1.5 text-zinc-500 transition hover:text-red-400 disabled:opacity-40"
                          aria-label={`Eliminar ${expense.description}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORMULARIO */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#171717] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#f7f4ed]">
                {editingId ? "Editar gasto" : "Registrar gasto"}
              </h3>

              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg p-1.5 text-zinc-500 transition hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[11px] text-zinc-500">
                  Descripción
                </label>

                <input
                  type="text"
                  required
                  maxLength={160}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Ej: Arriendo del local"
                  className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#FFD21C]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[11px] text-zinc-500">
                    Monto
                  </label>

                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={form.amount}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        amount: event.target.value,
                      }))
                    }
                    placeholder="0"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm font-bold text-white outline-none transition focus:border-[#FFD21C]/40"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] text-zinc-500">
                    Fecha
                  </label>

                  <input
                    type="date"
                    required
                    value={form.spent_at}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        spent_at: event.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#FFD21C]/40 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] text-zinc-500">
                  Categoría
                </label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as ExpenseCategory,
                    }))
                  }
                  className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#FFD21C]/40 [color-scheme:dark]"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] text-zinc-500">
                  Método de pago
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "efectivo", label: "Efectivo" },
                      { value: "digital", label: "Digital" },
                    ] as const
                  ).map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          payment_method: method.value,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2.5 text-[11px] font-bold transition ${
                        form.payment_method === method.value
                          ? "border-[#FFD21C]/50 bg-[#FFD21C]/15 text-[#FFD21C]"
                          : "border-white/[0.08] bg-black/20 text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] text-zinc-500">
                  Notas (opcional)
                </label>

                <textarea
                  rows={2}
                  maxLength={255}
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#FFD21C]/40"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-white/[0.08] px-3 py-2.5 text-[11px] font-semibold text-zinc-400 transition hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#FFD21C] px-3 py-2.5 text-[11px] font-bold text-[#111] transition hover:brightness-110 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : editingId ? "Guardar" : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
