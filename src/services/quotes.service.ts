import { createQuote } from "../repositories/quotes.repositories";
import { getServiceById } from "../repositories/services.repositories";
import { CreateQuoteDto } from "../types/CreateQuoteDto";

export async function createNewQuote(data: CreateQuoteDto) {
  const service = await getServiceById(data.serviceId);

  if (!service) {
    throw new Error("Servicio no encontrado");
  }

  const unitPrice = Number(service.price);

  const total = unitPrice * data.quantity;

  return createQuote({
    ...data,
    unitPrice,
    total,
  });
}
