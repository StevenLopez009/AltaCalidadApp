import {
  countItemsWithoutMaterial,
  getProfitByDay,
  getProfitByService,
  getProfitSummary,
  type ProfitFilters,
} from "../repositories/profit.repositories";

const TOP_SERVICES = 8;

function buildDayRange(from: string, to: string) {
  const days: string[] = [];

  const cursor = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);

  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function toDayString(value: unknown) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
}

function margin(revenue: number, profit: number) {
  return revenue > 0 ? (profit / revenue) * 100 : 0;
}

export async function getProfitReport(filters: ProfitFilters) {
  const [summary, daily, byService, coverage] = await Promise.all([
    getProfitSummary(filters),
    getProfitByDay(filters),
    getProfitByService(filters),
    countItemsWithoutMaterial(filters),
  ]);

  const revenue = Number(summary?.revenue) || 0;
  const cost = Number(summary?.cost) || 0;
  const profit = revenue - cost;

  const dailyMap = new Map(
    daily.map((row) => {
      const dayRevenue = Number(row.revenue) || 0;
      const dayCost = Number(row.cost) || 0;

      return [
        toDayString(row.day),
        {
          revenue: dayRevenue,
          cost: dayCost,
          profit: dayRevenue - dayCost,
        },
      ];
    }),
  );

  const series = buildDayRange(filters.from, filters.to).map((day) => ({
    day,
    ...(dailyMap.get(day) ?? { revenue: 0, cost: 0, profit: 0 }),
  }));

  const services = byService.map((row) => {
    const serviceRevenue = Number(row.revenue) || 0;
    const serviceCost = Number(row.cost) || 0;
    const serviceProfit = serviceRevenue - serviceCost;

    return {
      name: String(row.name),
      revenue: serviceRevenue,
      cost: serviceCost,
      profit: serviceProfit,
      margin: margin(serviceRevenue, serviceProfit),
      items: Number(row.items) || 0,
    };
  });

  const best = series.reduce<(typeof series)[number] | null>(
    (top, day) => (top === null || day.profit > top.profit ? day : top),
    null,
  );

  return {
    range: filters,

    summary: {
      revenue,
      cost,
      profit,
      margin: margin(revenue, profit),
      orders: Number(summary?.orders) || 0,
      dailyAverage: series.length > 0 ? profit / series.length : 0,
      bestDay: best && best.profit > 0 ? best : null,
      // Sin material asociado no hay costo que restar: el margen sale inflado.
      itemsWithoutMaterial: Number(coverage?.without_material) || 0,
      totalItems: Number(coverage?.total) || 0,
    },

    series,

    services: services.slice(0, TOP_SERVICES),
  };
}
