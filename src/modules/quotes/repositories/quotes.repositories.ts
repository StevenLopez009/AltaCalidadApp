import { db } from "@/src/shared/lib/db";
import { CreateQuoteDto } from "@/src/shared/types/CreateQuoteDto";
import type { ResultSetHeader } from "mysql2/promise";

export async function createQuote(data: CreateQuoteDto) {
  const [result] = await db.query<ResultSetHeader>(
    `
    INSERT INTO quotes
    (
      service_id,
      code,
      customer_name,
      phone,
      email,
      city,
      address,
      quantity,
      unit,
      unit_price,
      total,
      observations
    )
    VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)
    `,
    [
      data.serviceId,
      data.code,
      data.customerName,
      data.phone,
      data.email,
      data.city,
      data.address,
      data.quantity,
      data.unit,
      data.unitPrice,
      data.total,
      data.observations,
    ],
  );

  return result;
}
