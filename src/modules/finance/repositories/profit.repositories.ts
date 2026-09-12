import { db } from "@/src/shared/lib/db";
import type { RowDataPacket } from "mysql2/promise";

export interface ProfitFilters {
  from: string;
  to: string;
}

/**
 * Material consumido por un renglón, según cómo se cobra el servicio y el
 * factor de consumo declarado en el servicio.
 */
const MATERIAL_CONSUMED = `
  CASE oi.unit
    WHEN 'm2'    THEN COALESCE(oi.width, 0) * COALESCE(oi.height, 0) * oi.quantity
    WHEN 'metro' THEN COALESCE(oi.width, 0) * oi.quantity
    ELSE oi.quantity
  END * COALESCE(s.material_usage, 1)
`;

const MATERIAL_COST = `(${MATERIAL_CONSUMED} * COALESCE(m.unit_cost, 0))`;

// El descuento se aplica sobre el pedido completo, así que se reparte
// proporcionalmente entre sus renglones para no inflar el margen.
const NET_REVENUE = `(oi.subtotal * (1 - o.discount_percentage / 100))`;

const BASE_FROM = `
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN services s ON s.id = oi.service_id
  LEFT JOIN materials m ON m.id = s.material_id
  WHERE o.status <> 'cancelado'
    AND DATE(o.created_at) BETWEEN ? AND ?
`;

export async function getProfitSummary(filters: ProfitFilters) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        COALESCE(SUM(${NET_REVENUE}), 0) AS revenue,
        COALESCE(SUM(${MATERIAL_COST}), 0) AS cost,
        COUNT(DISTINCT o.id) AS orders
      ${BASE_FROM}
    `,
    [filters.from, filters.to],
  );

  return rows[0];
}

export async function getProfitByDay(filters: ProfitFilters) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        DATE(o.created_at) AS day,
        COALESCE(SUM(${NET_REVENUE}), 0) AS revenue,
        COALESCE(SUM(${MATERIAL_COST}), 0) AS cost
      ${BASE_FROM}
      GROUP BY DATE(o.created_at)
      ORDER BY day ASC
    `,
    [filters.from, filters.to],
  );

  return rows;
}

export async function getProfitByService(filters: ProfitFilters) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        COALESCE(s.name, 'Servicio eliminado') AS name,
        COALESCE(SUM(${NET_REVENUE}), 0) AS revenue,
        COALESCE(SUM(${MATERIAL_COST}), 0) AS cost,
        COUNT(*) AS items
      ${BASE_FROM}
      GROUP BY s.id, s.name
      ORDER BY (SUM(${NET_REVENUE}) - SUM(${MATERIAL_COST})) DESC
    `,
    [filters.from, filters.to],
  );

  return rows;
}

/** Renglones sin material asociado: su costo no se puede estimar. */
export async function countItemsWithoutMaterial(filters: ProfitFilters) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN s.material_id IS NULL THEN 1 ELSE 0 END), 0) AS without_material
      ${BASE_FROM}
    `,
    [filters.from, filters.to],
  );

  return rows[0];
}
