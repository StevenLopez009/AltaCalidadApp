import {
  getDailyBreakdown,
  getFinanceSummary,
  getPayments,
  getReceivables,
  type FinanceFilters,
  type PaymentMethod,
} from "../repositories/finance.repositories";

const MAX_MOVEMENTS = 100;

// El gráfico compara días entre sí, así que un día sin ingresos debe existir
// como cero: si se omite, las barras se juntan y el eje miente sobre el ritmo.
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

export async function getFinanceReport(filters: FinanceFilters) {
  const [summary, daily, movements, receivables] = await Promise.all([
    getFinanceSummary(filters),
    getDailyBreakdown(filters),
    getPayments(filters, MAX_MOVEMENTS),
    getReceivables(),
  ]);

  const dailyMap = new Map(
    daily.map((row) => [
      toDayString(row.day),
      {
        cash: Number(row.cash) || 0,
        digital: Number(row.digital) || 0,
        total: Number(row.total) || 0,
        transactions: Number(row.transactions) || 0,
      },
    ]),
  );

  const series = buildDayRange(filters.from, filters.to).map((day) => ({
    day,
    ...(dailyMap.get(day) ?? {
      cash: 0,
      digital: 0,
      total: 0,
      transactions: 0,
    }),
  }));

  const total = Number(summary?.total) || 0;
  const transactions = Number(summary?.transactions) || 0;

  const daysWithIncome = series.filter((day) => day.total > 0);

  const bestDay = daysWithIncome.reduce<(typeof series)[number] | null>(
    (best, day) => (best === null || day.total > best.total ? day : best),
    null,
  );

  return {
    range: {
      from: filters.from,
      to: filters.to,
      method: filters.method ?? null,
    },

    summary: {
      total,
      cash: Number(summary?.cash) || 0,
      digital: Number(summary?.digital) || 0,
      transactions,
      orders: Number(summary?.orders) || 0,
      averageTicket: transactions > 0 ? total / transactions : 0,
      dailyAverage: series.length > 0 ? total / series.length : 0,
      bestDay,
      pendingReceivable: Number(receivables?.pending) || 0,
      pendingOrders: Number(receivables?.orders) || 0,
    },

    series,

    movements: movements.map((row) => ({
      id: Number(row.id),
      orderId: Number(row.order_id),
      amount: Number(row.amount) || 0,
      paymentMethod: row.payment_method as PaymentMethod,
      notes: row.notes as string | null,
      paidAt: row.paid_at as Date,
      customerName: (row.customer_name as string | null) ?? "Sin cliente",
      customerType: row.customer_type as string | null,
      orderTotal: Number(row.order_total) || 0,
    })),
  };
}
