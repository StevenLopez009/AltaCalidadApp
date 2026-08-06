export interface Service {
  id: number;
  category_id: number;
  name: string;
  description: string;
  unit: "m2" | "unidad" | "minuto" | "area";
  price: number;
  image: string;
  created_at: Date;
}
