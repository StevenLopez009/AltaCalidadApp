import { db } from "@/src/shared/lib/db";
import { Category } from "@/src/shared/types/category";
import { CreateCategoryDto } from "@/src/shared/types/createCategoryDto";
import type { RowDataPacket } from "mysql2/promise";

export async function getCategories(): Promise<Category[]> {
  const [rows] = await db.query<(Category & RowDataPacket)[]>(
    `
    SELECT
        id,
        name,
        description,
        image,
        created_at, slug
    FROM categories
    ORDER BY name;
    `,
  );

  return rows;
}

export async function getCategoryBySlug(slug: string) {
  const [rows] = await db.query(
    "SELECT * FROM categories WHERE slug = ? LIMIT 1",
    [slug],
  );

  return (rows as any[])[0] ?? null;
}

export async function createCategory(data: CreateCategoryDto) {
  const [result] = await db.query(
    `
      INSERT INTO categories
      (
        name,
        description,
        image,
        slug
      )
      VALUES (?, ?, ?, ?)
    `,
    [data.name, data.description, data.image, data.slug],
  );

  return result;
}

export async function getCategoryById(id: number) {
  const [rows] = await db.query<(Category & RowDataPacket)[]>(
    `
    SELECT id, name, description, image, created_at, slug
    FROM categories
    WHERE id = ?
    LIMIT 1
    `,
    [id],
  );

  return rows[0] ?? null;
}

export async function updateCategory(
  id: number,
  data: { name: string; description: string; image: string; slug: string },
) {
  const [result] = await db.query(
    `
      UPDATE categories
      SET name = ?, description = ?, image = ?, slug = ?
      WHERE id = ?
    `,
    [data.name, data.description, data.image, data.slug, id],
  );

  return result;
}

export async function deleteCategory(id: number) {
  const [result] = await db.query(`DELETE FROM categories WHERE id = ?`, [id]);

  return result;
}

/** Referencias que impiden borrar una categoría sin romper relaciones. */
export async function countServicesUsingCategory(id: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM services WHERE category_id = ?`,
    [id],
  );

  return Number(rows[0]?.total) || 0;
}

export async function countMaterialsUsingCategory(id: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM materials WHERE category_id = ?`,
    [id],
  );

  return Number(rows[0]?.total) || 0;
}

export async function countOrderItemsUsingCategory(id: number) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM order_items WHERE category_id = ?`,
    [id],
  );

  return Number(rows[0]?.total) || 0;
}
