"use client";

import { useCallback, useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Info, Package, TrendingUp, Wallet } from "lucide-react";

// Misma paleta validada del panel de finanzas sobre la superficie #171717.
const COST_COLOR = "#d95926";
const PROFIT_COLOR = "#3987e5";
const GRID_COLOR = "#2b2b2b";

const BAR_MAX_WIDTH = 24;
const CORNER_RADIUS = 4;
const STACK_GAP = 2;

interface DayPoint {
  day: string;
  revenue: number;
  cost: number;
  profit: number;
}

interface ServiceRow {
  name: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
  items: number;
}

interface ProfitReport {
  range: { from: string; to: string };
  summary: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
    orders: number;
    dailyAverage: number;
    bestDay: DayPoint | null;
    itemsWithoutMaterial: number;
    totalItems: number;
  };
  series: DayPoint[];
  services: ServiceRow[];
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

  const start = new Date();
  start.setDate(start.getDate() - (Number(preset) - 1));

  return { from: toISODate(start), to: toISODate(today) };
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatCompactMoney(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  }

  if (Math.abs(value) >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }

  return `$${Math.round(value)}`;
}

function formatDayLabel(day: string) {
  return new Date(`${day}T00:00:00`).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
  });
}

interface SegmentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: DayPoint;
}

/** Extremo redondeado solo en el tope visible y 2px de aire entre segmentos. */
function stackedSegment(isBottom: boolean) {
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

    const isTop = isBottom ? (payload?.profit ?? 0) <= 0 : true;
    const hasBelow = !isBottom && (payload?.cost ?? 0) > 0;

    const gap = hasBelow ? STACK_GAP : 0;
    const drawY = y + gap;
    const drawHeight = Math.max(height - gap, 0.5);
    const radius = Math.min(CORNER_RADIUS, drawHeight, width / 2);

    const path = isTop
      ? `M${x},${drawY + drawHeight} L${x},${drawY + radius}
         Q${x},${drawY} ${x + radius},${drawY}
         L${x + width - radius},${drawY}
         Q${x + width},${drawY} ${x + width},${drawY + radius}
         L${x + width},${drawY + drawHeight} Z`
      : `M${x},${drawY + drawHeight} L${x},${drawY}
         L${x + width},${drawY} L${x + width},${drawY + drawHeight} Z`;

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
  if (!active || !payload?.length) return null;

  const point = payload[0].payload;

  const margin =
    point.revenue > 0 ? Math.round((point.profit / point.revenue) * 100) : 0;

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
              style={{ backgroundColor: COST_COLOR }}
            />
            Costo material
          </span>

          <span className="font-medium text-[#f7f4ed]">
            {formatMoney(point.cost)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: PROFIT_COLOR }}
            />
            Ganancia
          </span>

          <span className="font-medium text-[#f7f4ed]">
            {formatMoney(point.profit)}
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-6 border-t border-white/10 pt-1.5">
          <span className="text-zinc-500">Facturado</span>

          <span className="font-semibold text-[#f7f4ed]">
            {formatMoney(point.revenue)}
          </span>
        </div>

        <p className="text-[10px] text-zinc-600">Margen {margin}%</p>
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
  icon: typeof Wallet;
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

export default function ProfitControl() {
  const [preset, setPreset] = useState<Preset>("30");
  const [range, setRange] = useState(() => rangeFromPreset("30"));

  const [report, setReport] = useState<ProfitReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ from: range.from, to: range.to });

      const response = await fetch(`/api/profit?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo cargar el reporte");
      }

      setReport(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudo cargar el reporte",
      );

      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [range.from, range.to]);

  useEffect(() => {
    load();
  }, [load]);

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

  const hasData = (report?.series ?? []).some((day) => day.revenue > 0);

  const maxProfit = Math.max(
    ...(report?.services ?? []).map((service) => Math.abs(service.profit)),
    1,
  );

  return (
    <div className="text-[#f7f4ed]">
      {/* ENCABEZADO */}
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Ganancias por venta
        </h2>

        <p className="mt-1 text-xs text-zinc-500">
          Lo facturado menos el costo del material consumido
        </p>
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
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-[#FF3030]/30 bg-[#FF3030]/10 px-4 py-3 text-xs text-[#ff8f8f]">
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#3987e5]/[0.14] to-transparent p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#6aa9ee]" />

            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Ganancia estimada
            </span>
          </div>

          <p className="text-4xl font-bold tracking-tight text-[#f7f4ed]">
            {loading ? "—" : formatMoney(summary?.profit ?? 0)}
          </p>

          <p className="mt-1 text-[11px] text-zinc-500">
            Margen {(summary?.margin ?? 0).toFixed(1)}% · promedio diario{" "}
            {formatMoney(summary?.dailyAverage ?? 0)}
          </p>
        </div>

        <StatTile
          label="Facturado"
          value={loading ? "—" : formatMoney(summary?.revenue ?? 0)}
          detail={`${summary?.orders ?? 0} ${
            summary?.orders === 1 ? "pedido" : "pedidos"
          } en el rango`}
          icon={Wallet}
        />

        <StatTile
          label="Costo de material"
          value={loading ? "—" : formatMoney(summary?.cost ?? 0)}
          detail={`${
            summary && summary.revenue > 0
              ? Math.round((summary.cost / summary.revenue) * 100)
              : 0
          }% de lo facturado`}
          accent={COST_COLOR}
          icon={Package}
        />

        <StatTile
          label="Mejor día"
          value={
            loading || !summary?.bestDay
              ? "—"
              : formatMoney(summary.bestDay.profit)
          }
          detail={
            summary?.bestDay
              ? formatDayLabel(summary.bestDay.day)
              : "Sin ventas en el rango"
          }
          accent={PROFIT_COLOR}
          icon={TrendingUp}
        />
      </div>

      {/* AVISO DE COBERTURA */}
      {!loading && (summary?.itemsWithoutMaterial ?? 0) > 0 && (
        <div className="mb-5 flex items-start gap-2 rounded-xl border border-[#FFD21C]/25 bg-[#FFD21C]/[0.07] px-4 py-3 text-[11px] text-[#f3d98a]">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />

          <span>
            {summary?.itemsWithoutMaterial} de {summary?.totalItems} renglones
            no tienen material asociado, así que su costo no se descuenta y la
            ganancia real es menor. Asigna el material en Productos y servicios.
          </span>
        </div>
      )}

      {/* GRÁFICO POR DÍA */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#f7f4ed]">
              Costo y ganancia por día
            </h3>

            <p className="mt-0.5 text-[11px] text-zinc-500">
              La barra completa es lo facturado ese día
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COST_COLOR }}
              />
              Costo material
            </span>

            <span className="flex items-center gap-1.5 text-zinc-400">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: PROFIT_COLOR }}
              />
              Ganancia
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-xs text-zinc-600">Cargando...</p>
          </div>
        ) : !hasData ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-1">
            <p className="text-sm text-zinc-500">No hay ventas en este rango</p>

            <p className="text-xs text-zinc-600">
              Los pedidos creados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
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
                  dataKey="cost"
                  stackId="money"
                  fill={COST_COLOR}
                  maxBarSize={BAR_MAX_WIDTH}
                  shape={stackedSegment(true)}
                  isAnimationActive={false}
                />

                <Bar
                  dataKey="profit"
                  stackId="money"
                  fill={PROFIT_COLOR}
                  maxBarSize={BAR_MAX_WIDTH}
                  shape={stackedSegment(false)}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* RENTABILIDAD POR SERVICIO */}
      {!loading && (report?.services.length ?? 0) > 0 && (
        <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
          <h3 className="text-sm font-semibold text-[#f7f4ed]">
            Qué deja más ganancia
          </h3>

          <p className="mt-0.5 mb-4 text-[11px] text-zinc-500">
            Servicios ordenados por ganancia en el rango
          </p>

          <ul className="space-y-2.5">
            {(report?.services ?? []).map((service) => (
              <li key={service.name}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="truncate text-xs text-zinc-300">
                    {service.name}
                  </span>

                  <span className="shrink-0 text-xs font-semibold text-[#f7f4ed]">
                    {formatMoney(service.profit)}
                    <span className="ml-1.5 text-[10px] font-normal text-zinc-500">
                      {Math.round(service.margin)}%
                    </span>
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(
                        (Math.abs(service.profit) / maxProfit) * 100,
                        2,
                      )}%`,
                      backgroundColor:
                        service.profit >= 0 ? PROFIT_COLOR : COST_COLOR,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
