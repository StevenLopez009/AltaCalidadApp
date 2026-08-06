import { CreateQuoteDto } from "@/src/shared/types/CreateQuoteDto";
import { getServiceById } from "../../services/repositories/services.repositories";
import { createQuote } from "../repositories/quotes.repositories";

function generateQuoteCode(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `AC-${year}${month}${day}-${random}`;
}

export async function createNewQuote(data: CreateQuoteDto) {
  const service = await getServiceById(data.serviceId);

  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  const unitPrice = Number(service.price);
  const total = unitPrice * data.quantity;
  const code = generateQuoteCode();

  const quoteData = {
    ...data,
    code,
    unit: service.unit,
    unitPrice,
    total,
  };

  const result = await createQuote(quoteData);

  return {
    id: result.insertId,
    code,
  };
}
