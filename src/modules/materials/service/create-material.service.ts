import { CreateMaterialDto } from "@/src/shared/types/CreateMaterialDto";
import {
  countServicesUsingMaterial,
  createMaterial,
  deleteMaterial,
  getAllMaterials,
  getMaterialById,
  getMaterialsByCategory,
  updateMaterial,
} from "../repositories/materials.repositories";

function validateMaterial(data: CreateMaterialDto) {
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
}

export async function createNewMaterial(data: CreateMaterialDto) {
  validateMaterial(data);

  return await createMaterial(data);
}

export async function editMaterial(id: number, data: CreateMaterialDto) {
  validateMaterial(data);

  const material = await getMaterialById(id);

  if (!material) {
    throw new Error("El material no existe");
  }

  return await updateMaterial(id, data);
}

export async function removeMaterial(id: number) {
  const material = await getMaterialById(id);

  if (!material) {
    throw new Error("El material no existe");
  }

  // Sin material, esos servicios dejarían de descontar inventario al vender.
  const services = await countServicesUsingMaterial(id);

  if (services > 0) {
    throw new Error(
      `No se puede eliminar: ${services} ${
        services === 1 ? "servicio usa" : "servicios usan"
      } este material`,
    );
  }

  return await deleteMaterial(id);
}

export async function getMaterials() {
  return await getAllMaterials();
}

export async function getMaterialsForCategory(categoryId: number) {
  return await getMaterialsByCategory(categoryId);
}
