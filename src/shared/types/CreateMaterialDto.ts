export interface CreateMaterialDto {
  categoryId: number;
  name: string;
  description: string;
  unit: string;
  stock: number;
  minimumStock: number;
  unitCost: number;
}
