import { db } from "@/src/shared/lib/db";
import { CreateMaterialDto } from "@/src/shared/types/CreateMaterialDto";
import type { Material } from "@/src/shared/types/material";
import type { PoolConnection } from "mysql2/promise";

export async function createMaterial(data: CreateMaterialDto) {
  const [result] = await db.query(
    `
    INSERT INTO materials
    (
      category_id,
      name,
      description,
      unit,
      stock,
      minimum_stock,
      unit_cost
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.categoryId,
      data.name,
      data.description,
      data.unit,
      data.stock,
      data.minimumStock,
      data.unitCost,
    ],
  );

  return result;
}

export async function getMaterialsByCategory(categoryId: number) {
  const [rows] = await db.query(
    `
    SELECT
      id,
      name
    FROM materials
    WHERE category_id = ?
    ORDER BY name
    `,
    [categoryId],
  );

  return rows;
}

export async function getAllMaterials(): Promise<Material[]> {
  const [rows] = await db.query<Material[]>(
    `
    SELECT
      id,
      category_id,
      name,
      description,
      unit,
      stock,
      minimum_stock,
      unit_cost,
      created_at,
      updated_at
    FROM materials
    ORDER BY name ASC
    `,
  );

  return rows;
}

export async function decreaseMaterialStock(
  connection: PoolConnection,
  materialId: number,
  quantity: number,
) {
  const [result] = await connection.query(
    `
    UPDATE materials
    SET stock = stock - ?
    WHERE id = ?
      AND stock >= ?
    `,
    [quantity, materialId, quantity],
  );

  return result;
}
