import { db } from "../../../shared/lib/db";
import { Admin } from "../../../shared/types/admin";

export async function getAdminByUsername(
  username: string,
): Promise<Admin | null> {
  const [rows] = await db.query<Admin[]>(
    `
      SELECT
        id,
        username,
        password,
        created_at
      FROM admins
      WHERE username = ?
      LIMIT 1;
    `,
    [username],
  );

  return rows[0] ?? null;
}
