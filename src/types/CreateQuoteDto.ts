export interface CreateQuoteDto {
  serviceId: number;

  customerName: string;
  phone: string;
  email?: string;

  city: string;
  address?: string;

  quantity: number;

  installation: boolean;

  observations?: string;
}
