export interface Material {
  id: number;
  category_id: number;
  name: string;
  description: string;
  unit: string;
  stock: number;
  minimum_stock: number;
  unit_cost: number;
  created_at: Date;
  updated_at: Date;
}
