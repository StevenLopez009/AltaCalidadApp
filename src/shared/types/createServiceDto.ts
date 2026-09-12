export interface CreateServiceDto {
  category_id: number;
  material_id: number | null;
  material_usage?: number;
  name: string;
  description: string;
  unit: string;
  price: number;
  image: string;
}
