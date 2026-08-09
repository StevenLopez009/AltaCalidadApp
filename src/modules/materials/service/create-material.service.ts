import { CreateMaterialDto } from "@/src/shared/types/CreateMaterialDto";
import { createMaterial } from "../repositories/materials.repositories";

export async function createNewMaterial(data: CreateMaterialDto) {
  if (!data.categoryId) {
    throw new Error("La categoría es obligatoria");
  }

  if (!data.name.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (data.stock < 0) {
    throw new Error("El stock no puede ser negativo");
  }

  if (data.minimumStock < 0) {
    throw new Error("El stock mínimo no puede ser negativo");
  }

  if (data.unitCost < 0) {
    throw new Error("El costo unitario no puede ser negativo");
  }

  return await createMaterial(data);
}
