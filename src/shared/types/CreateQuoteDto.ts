export interface CreateQuoteDto {
  serviceId: number;
  customerName: string;
  phone: string;
  email?: string;
  unit: string;
  code: string;
  city: string;
  address?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  observations?: string;
}
