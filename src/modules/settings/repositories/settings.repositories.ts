import { db } from "@/src/shared/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export async function getSetting(key: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    `
      SELECT setting_value
      FROM site_settings
      WHERE setting_key = ?
      LIMIT 1
    `,
    [key],
  );

  return (rows[0]?.setting_value as string | undefined) ?? null;
}

export async function saveSetting(key: string, value: string) {
  const [result] = await db.query<ResultSetHeader>(
    `
      INSERT INTO site_settings (setting_key, setting_value)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    `,
    [key, value],
  );

  return result;
}
