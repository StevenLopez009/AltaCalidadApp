import { db } from "@/src/shared/lib/db";
import { Company } from "@/src/shared/types/company";
import { CreateCompanyDto } from "@/src/shared/types/createCompanyDto";
import type { RowDataPacket } from "mysql2/promise";

export async function getCompanies(): Promise<Company[]> {
  const [rows] = await db.query<(Company & RowDataPacket)[]>(
    `
      SELECT
        id,
        name_company,
        telefono,
        discount_percentage,
        created_at,
        updated_at
      FROM company
      ORDER BY name_company;
    `,
  );

  return rows;
}

export async function getCompanyById(id: number) {
  const [rows] = await db.query(
    `
      SELECT
        id,
        name_company,
        telefono,
        discount_percentage,
        created_at,
        updated_at
      FROM company
      WHERE id = ?
      LIMIT 1;
    `,
    [id],
  );

  return (rows as any[])[0] ?? null;
}

export async function createCompany(data: CreateCompanyDto) {
  const [result] = await db.query(
    `
      INSERT INTO company
      (
        name_company,
         telefono,
        discount_percentage
      )
      VALUES (?, ?, ?)
    `,
    [data.nameCompany, data.telefono, data.discountPercentage],
  );

  return result;
}

export async function deleteCompany(id: number) {
  const [result] = await db.query(
    `
      DELETE FROM company
      WHERE id = ?
    `,
    [id],
  );

  return result;
}
