import { db } from "../lib/db";
import { CreateQuoteDto } from "../types/CreateQuoteDto";

export async function createQuote(data: CreateQuoteDto) {
  const [result] = await db.query(
    `
    INSERT INTO quotes
    (
      service_id,
      customer_name,
      phone,
      email,
      city,
      address,
      quantity,
      unit_price,
      total,
      installation,
      observations
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.serviceId,
      data.customerName,
      data.phone,
      data.email,
      data.city,
      data.address,
      data.quantity,
      data.unitPrice,
      data.total,
      data.installation,
      data.observations,
    ],
  );

  return result;
}
