import { db } from "@/src/shared/lib/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";

export interface PortfolioImage {
  id: number;
  image_url: string;
  title: string | null;
  sort_order: number;
  active: number;
}

export async function getPortfolioImages(onlyActive = true) {
  const [rows] = await db.query<(PortfolioImage & RowDataPacket)[]>(
    `
      SELECT id, image_url, title, sort_order, active
      FROM portfolio_images
      ${onlyActive ? "WHERE active = TRUE" : ""}
      ORDER BY sort_order ASC, id ASC
    `,
  );

  return rows;
}

export async function createPortfolioImage(data: {
  imageUrl: string;
  title: string | null;
}) {
  const [orderRows] = await db.query<RowDataPacket[]>(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM portfolio_images`,
  );

  const nextOrder = Number(orderRows[0]?.next_order) || 0;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO portfolio_images (image_url, title, sort_order) VALUES (?, ?, ?)`,
    [data.imageUrl, data.title, nextOrder],
  );

  return { result, sortOrder: nextOrder };
}

export async function getPortfolioImageById(id: number) {
  const [rows] = await db.query<(PortfolioImage & RowDataPacket)[]>(
    `SELECT id, image_url, title, sort_order, active FROM portfolio_images WHERE id = ? LIMIT 1`,
    [id],
  );

  return rows[0] ?? null;
}

export async function deletePortfolioImage(id: number) {
  const [result] = await db.query<ResultSetHeader>(
    `DELETE FROM portfolio_images WHERE id = ?`,
    [id],
  );

  return result;
}
