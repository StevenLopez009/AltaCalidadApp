import { db } from "@/src/shared/lib/db";
import { Category } from "@/src/shared/types/category";
import { CreateCategoryDto } from "@/src/shared/types/createCategoryDto";

export async function getCategories(): Promise<Category[]> {
  const [rows] = await db.query<Category[]>(
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
