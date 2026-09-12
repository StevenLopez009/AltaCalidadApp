"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Banknote, CreditCard, Clock, TrendingUp } from "lucide-react";

// Paleta validada con el validador de dataviz sobre la superficie #171717:
// separación CVD ΔE 26.8 y visión normal ΔE 31.8 (mínimos 8 y 15).
const CASH_COLOR = "#d95926";
const DIGITAL_COLOR = "#3987e5";
const GRID_COLOR = "#2b2b2b";

const BAR_MAX_WIDTH = 24;
const CORNER_RADIUS = 4;
const STACK_GAP = 2;

type PaymentMethod = "efectivo" | "digital";

type MethodFilter = PaymentMethod | "todos";

interface DayPoint {
  day: string;
  cash: number;
  digital: number;
  total: number;
  transactions: number;
}

interface Movement {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  notes: string | null;
  paidAt: string;
  customerName: string;
  customerType: string | null;
  orderTotal: number;
}

interface FinanceReport {
  range: { from: string; to: string; method: MethodFilter | null };
  summary: {
    total: number;
    cash: number;
    digital: number;
    transactions: number;
    orders: number;
    averageTicket: number;
    dailyAverage: number;
    bestDay: DayPoint | null;
    pendingReceivable: number;
    pendingOrders: number;
  };
  series: DayPoint[];
  movements: Movement[];
}

const PRESETS = [
  { value: "7", label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "90", label: "90 días" },
  { value: "mes", label: "Este mes" },
] as const;

type Preset = (typeof PRESETS)[number]["value"] | "personalizado";

function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function rangeFromPreset(preset: Preset) {
  const today = new Date();

  if (preset === "mes") {
    return {
      from: toISODate(new Date(today.getFullYear(), today.getMonth(), 1)),
      to: toISODate(today),
    };
  }

  const days = Number(preset);

  const start = new Date();
  start.setDate(start.getDate() - (days - 1));

  return { from: toISODate(start), to: toISODate(today) };
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatCompactMoney(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }

  return `$${Math.round(value)}`;
}

function formatDayLabel(day: string) {
  const date = new Date(`${day}T00:00:00`);

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Dibuja un segmento del apilado con el extremo superior redondeado solo cuando
 * es el tope visible de la barra, y reserva 2px del color de superficie entre
 * segmentos para que se separen sin necesidad de un borde.
 */
interface SegmentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: DayPoint;
}

function stackedSegment(isTopWhenAlone: boolean) {
  return function Segment(props: SegmentProps) {
    const x = Number(props.x);
    const y = Number(props.y);
    const width = Number(props.width);
    const height = Number(props.height);
    const fill = String(props.fill);
    const payload = props.payload;

    if (!Number.isFinite(height) || height <= 0) {
      return <g />;
    }

    // El segmento inferior (efectivo) solo corona la barra si no hay digital.
    const isTop = isTopWhenAlone ? (payload?.digital ?? 0) <= 0 : true;

    // El gap se descuenta del segmento superior, nunca del que apoya en la base.
    const hasSegmentBelow = !isTopWhenAlone && (payload?.cash ?? 0) > 0;

    const gap = hasSegmentBelow ? STACK_GAP : 0;

    const drawY = y + gap;
    const drawHeight = Math.max(height - gap, 0.5);

    const radius = Math.min(CORNER_RADIUS, drawHeight, width / 2);

    const path = isTop
      ? `M${x},${drawY + drawHeight}
         L${x},${drawY + radius}
         Q${x},${drawY} ${x + radius},${drawY}
         L${x + width - radius},${drawY}
         Q${x + width},${drawY} ${x + width},${drawY + radius}
         L${x + width},${drawY + drawHeight}
         Z`
      : `M${x},${drawY + drawHeight}
         L${x},${drawY}
         L${x + width},${drawY}
         L${x + width},${drawY + drawHeight}
         Z`;

    return <path d={path} fill={fill} />;
  };
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: DayPoint }[];
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d0d] px-3 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <p className="mb-2 text-[11px] font-semibold text-[#f7f4ed]">
        {formatDayLabel(point.day)}
      </p>

      <div className="space-y-1 text-[11px]">
        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: CASH_COLOR }}
            />
            Efectivo
          </span>

          <span className="font-medium text-[#f7f4ed]">
            {formatMoney(point.cash)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: DIGITAL_COLOR }}
            />
            Digital
          </span>

          <span className="font-medium text-[#f7f4ed]">
            {formatMoney(point.digital)}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-6 border-t border-white/10 pt-1.5">
          <span className="text-zinc-500">Total</span>

          <span className="font-semibold text-[#f7f4ed]">
            {formatMoney(point.total)}
          </span>
        </div>

        <p className="text-[10px] text-zinc-600">
          {point.transactions}{" "}
          {point.transactions === 1 ? "movimiento" : "movimientos"}
        </p>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  detail,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: string;
  icon: typeof Banknote;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="mb-3 flex items-center gap-2">
        {accent ? (
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: accent }}
          />
        ) : (
          <Icon className="h-4 w-4 text-zinc-500" />
        )}

        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </span>
      </div>

      <p className="text-2xl font-bold tracking-tight text-[#f7f4ed]">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-zinc-500">{detail}</p>
    </div>
  );
}

export default function FinanceControl() {
  const [preset, setPreset] = useState<Preset>("30");
  const [range, setRange] = useState(() => rangeFromPreset("30"));
  const [method, setMethod] = useState<MethodFilter>("todos");

  const [report, setReport] = useState<FinanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        from: range.from,
        to: range.to,
        method,
      });

      const response = await fetch(`/api/finance?${params.toString()}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo cargar el reporte");
      }

      setReport(data);
    } catch (requestError) {
      console.error("Error obteniendo finanzas:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo cargar el reporte",
      );

      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to, method]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  function applyPreset(value: Preset) {
    setPreset(value);

    if (value !== "personalizado") {
      setRange(rangeFromPreset(value));
    }
  }

  function updateRange(key: "from" | "to", value: string) {
    setPreset("personalizado");
    setRange((current) => ({ ...current, [key]: value }));
  }

  const summary = report?.summary;

  const cashShare = useMemo(() => {
    if (!summary || summary.total <= 0) return 0;

    return Math.round((summary.cash / summary.total) * 100);
  }, [summary]);

  const hasData = (report?.series ?? []).some((day) => day.total > 0);

  return (
    <div className="text-[#f7f4ed]">
      {/* ENCABEZADO */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Control de finanzas
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            Entradas de dinero registradas por abono de pedidos
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTable((current) => !current)}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-zinc-400 transition hover:text-white"
        >
          {showTable ? "Ver gráfico" : "Ver tabla"}
        </button>
      </div>

      {/* FILTROS */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
          {PRESETS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => applyPreset(item.value)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                preset === item.value
                  ? "bg-[#FFD21C] text-[#111]"
                  : "text-zinc-400 hover:text-white"
              }`}
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
            onChange={(event) => updateRange("from", event.target.value)}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] text-zinc-300 outline-none focus:border-[#FFD21C]/40 [color-scheme:dark]"
          />

          <span className="text-[11px] text-zinc-600">a</span>

          <input
            type="date"
            value={range.to}
            min={range.from}
            onChange={(event) => updateRange("to", event.target.value)}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-[11px] text-zinc-300 outline-none focus:border-[#FFD21C]/40 [color-scheme:dark]"
          />
        </div>

        <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.02] p-1">
          {(
            [
              { value: "todos", label: "Todos", color: null },
              { value: "efectivo", label: "Efectivo", color: CASH_COLOR },
              { value: "digital", label: "Digital", color: DIGITAL_COLOR },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMethod(item.value)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition ${
                method === item.value
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {item.color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              )}

              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-[#FF3030]/30 bg-[#FF3030]/10 px-4 py-3 text-xs text-[#ff8f8f]">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#FFD21C]/[0.12] to-transparent p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#FFD21C]" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Total ingresado
            </span>
          </div>

          <p className="text-4xl font-bold tracking-tight text-[#f7f4ed]">
            {loading ? "—" : formatMoney(summary?.total ?? 0)}
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            {summary?.transactions ?? 0}{" "}
            {summary?.transactions === 1 ? "movimiento" : "movimientos"} ·
            promedio diario {formatMoney(summary?.dailyAverage ?? 0)}
          </p>
        </div>

        <StatTile
          label="Efectivo"
          value={loading ? "—" : formatMoney(summary?.cash ?? 0)}
          detail={`${cashShare}% del total ingresado`}
          accent={CASH_COLOR}
          icon={Banknote}
        />

        <StatTile
          label="Pago digital"
          value={loading ? "—" : formatMoney(summary?.digital ?? 0)}
          detail={`${100 - cashShare}% del total ingresado`}
          accent={DIGITAL_COLOR}
          icon={CreditCard}
        />

        <StatTile
          label="Por cobrar"
          value={loading ? "—" : formatMoney(summary?.pendingReceivable ?? 0)}
          detail={`${summary?.pendingOrders ?? 0} ${
            summary?.pendingOrders === 1 ? "pedido" : "pedidos"
          } con saldo pendiente`}
          icon={Clock}
        />
      </div>

      {/* GRÁFICO / TABLA */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#f7f4ed]">
              Ingresos por día
            </h3>

            <p className="mt-0.5 text-[11px] text-zinc-500">
              {summary?.bestDay
                ? `Mejor día: ${formatDayLabel(summary.bestDay.day)} con ${formatMoney(summary.bestDay.total)}`
                : "Sin ingresos registrados en el rango"}
            </p>
          </div>

          {/* LEYENDA: identidad nunca depende solo del color del gráfico */}
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: CASH_COLOR }}
              />
              Efectivo
            </span>

            <span className="flex items-center gap-1.5 text-zinc-400">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: DIGITAL_COLOR }}
              />
              Digital
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[320px] items-center justify-center">
            <p className="text-xs text-zinc-600">Cargando...</p>
          </div>
        ) : showTable ? (
          <MovementsTable movements={report?.movements ?? []} />
        ) : !hasData ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-1">
            <p className="text-sm text-zinc-500">
              No hay ingresos en este rango
            </p>

            <p className="text-xs text-zinc-600">
              Los abonos registrados en los pedidos aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={report?.series ?? []}
                margin={{ top: 8, right: 8, bottom: 4, left: 8 }}
              >
                <CartesianGrid
                  stroke={GRID_COLOR}
                  strokeWidth={1}
                  vertical={false}
                />

                <XAxis
                  dataKey="day"
                  tickFormatter={formatDayLabel}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: GRID_COLOR }}
                  minTickGap={24}
                />

                <YAxis
                  tickFormatter={formatCompactMoney}
                  tick={{ fill: "#71717a", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />

                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />

                <Bar
                  dataKey="cash"
                  stackId="income"
                  fill={CASH_COLOR}
                  maxBarSize={BAR_MAX_WIDTH}
                  shape={stackedSegment(true)}
                  isAnimationActive={false}
                />

                <Bar
                  dataKey="digital"
                  stackId="income"
                  fill={DIGITAL_COLOR}
                  maxBarSize={BAR_MAX_WIDTH}
                  shape={stackedSegment(false)}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* MOVIMIENTOS */}
      {!showTable && !loading && (report?.movements.length ?? 0) > 0 && (
        <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="mb-4 text-sm font-semibold text-[#f7f4ed]">
            Últimos movimientos
          </h3>

          <MovementsTable movements={(report?.movements ?? []).slice(0, 8)} />
        </div>
      )}
    </div>
  );
}

function MovementsTable({ movements }: { movements: Movement[] }) {
  if (movements.length === 0) {
    return (
      <p className="py-8 text-center text-xs text-zinc-600">
        No hay movimientos en este rango
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left">
        <thead>
          <tr className="border-b border-white/[0.07] text-[10px] uppercase tracking-wider text-zinc-600">
            <th className="pb-2 font-medium">Fecha</th>
            <th className="pb-2 font-medium">Cliente</th>
            <th className="pb-2 font-medium">Pedido</th>
            <th className="pb-2 font-medium">Método</th>
            <th className="pb-2 text-right font-medium">Monto</th>
          </tr>
        </thead>

        <tbody className="text-xs">
          {movements.map((movement) => (
            <tr
              key={movement.id}
              className="border-b border-white/[0.04] last:border-0"
            >
              <td className="py-2.5 text-zinc-500">
                {formatDateTime(movement.paidAt)}
              </td>

              <td className="py-2.5 text-zinc-300">{movement.customerName}</td>

              <td className="py-2.5 text-zinc-500">#{movement.orderId}</td>

              <td className="py-2.5">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        movement.paymentMethod === "efectivo"
                          ? CASH_COLOR
                          : DIGITAL_COLOR,
                    }}
                  />
                  {movement.paymentMethod === "efectivo"
                    ? "Efectivo"
                    : "Digital"}
                </span>
              </td>

              <td className="py-2.5 text-right font-semibold text-[#f7f4ed]">
                {formatMoney(movement.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
