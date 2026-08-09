import { db } from "@/src/shared/lib/db";
import { CreateServiceDto } from "@/src/shared/types/createServiceDto";
import { Service } from "@/src/shared/types/service";

export async function getServicesByCategoryId(
  categoryId: number,
): Promise<Service[]> {
  const [rows] = await db.query<Service[]>(
    `
    SELECT
      id,
      category_id,
      name,
      description,
      unit,
      material_id,
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
  const [rows] = await db.query<Service[]>(
    `
    SELECT
      id,
      category_id,
      name,
      description,
      unit,
      material_id,
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

export async function createService(data: CreateServiceDto) {
  const [result] = await db.query(
    `
      INSERT INTO services
      (
          category_id,
          material_id,
          name,
          description,
          unit,
          price,
          image
      )
      VALUES (?, ?,?, ?, ?, ?, ?)
    `,
    [
      data.category_id,
      data.material_id,
      data.name,
      data.description,
      data.unit,
      data.price,
      data.image,
    ],
  );

  return result;
}
