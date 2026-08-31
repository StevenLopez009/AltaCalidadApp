import { db } from "@/src/shared/lib/db";

export interface CreateUserData {
  name: string;
  phone: string;
}

export async function getUserByPhone(phone: string) {
  const [rows] = await db.query(
    `
      SELECT *
      FROM users
      WHERE phone = ?
      LIMIT 1
    `,
    [phone],
  );

  return (rows as any[])[0] ?? null;
}

export async function createUser(data: CreateUserData) {
  const [result] = await db.query(
    `
      INSERT INTO users
      (
        name,
        phone
      )
      VALUES (?, ?)
    `,
    [data.name, data.phone],
  );

  return result;
}
