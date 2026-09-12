export interface Service {
  id: number;
  category_id: number;
  name: string;
  description: string;
  unit: "m2" | "unidad" | "minuto" | "area" | "metro";
  material_id: number | null;
  material_usage: number;
  price: number;
  image: string;
  created_at: Date;
}
