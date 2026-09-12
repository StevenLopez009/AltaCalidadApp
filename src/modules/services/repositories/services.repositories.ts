import { db } from "@/src/shared/lib/db";
import { CreateServiceDto } from "@/src/shared/types/createServiceDto";
import { Service } from "@/src/shared/types/service";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function getServices() {
  // Devuelve el registro completo: el listado del panel edita desde aquí y,
  // si faltara un campo, al guardar se perdería su valor.
  const [rows] = await db.query(`
    SELECT
      id,
      category_id,
      material_id,
      material_usage,
      name,
      description,
      unit,
      price,
      image,
      created_at
    FROM services
    ORDER BY name;
  `);

  return rows;
}

export async function getServicesByCategoryId(
  categoryId: number,
): Promise<Service[]> {
  const [rows] = await db.query<(Service & RowDataPacket)[]>(
    `
    SELECT
      id,
      category_id,
      name,
      description,
      unit,
      material_id,
      material_usage,
      price,
      image,
      created_at
    FROM services
    WHERE category_id = ?
    ORDER BY name;
    `,
    [categoryId],
  );

  return rows;
}

export async function getServiceById(id: number): Promise<Service | null> {
  const [rows] = await db.query<(Service & RowDataPacket)[]>(
    `
    SELECT
      id,
      category_id,
      name,
      description,
      unit,
      material_id,
      material_usage,
      price,
      image,
      created_at
    FROM services
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function updateService(id: number, data: CreateServiceDto) {
  const [result] = await db.query<ResultSetHeader>(
    `
      UPDATE services
      SET category_id = ?,
          material_id = ?,
          material_usage = ?,
          name = ?,
          description = ?,
          unit = ?,
          price = ?,
          image = ?
      WHERE id = ?
    `,
    [
      data.category_id,
      data.material_id,
      data.material_usage ?? 1,
      data.name,
      data.description,
      data.unit,
      data.price,
      data.image,
      id,
    ],
  );

  return result;
}

export async function deleteService(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM services WHERE id = ?`,
    [id],
  );

  return result;
}

/** Pedidos que ya incluyen el servicio: borrarlo perdería el histórico. */
export async function countOrdersUsingService(id: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(DISTINCT order_id) AS total FROM order_items WHERE service_id = ?`,
    [id],
  );

  return Number(rows[0]?.total) || 0;
}

export async function createService(data: CreateServiceDto) {
  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO services
      (
          category_id,
          material_id,
          material_usage,
          name,
          description,
          unit,
          price,
          image
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.category_id,
      data.material_id,
      data.material_usage ?? 1,
      data.name,
      data.description,
      data.unit,
      data.price,
      data.image,
    ],
  );

  return result;
}
