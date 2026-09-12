import { CreateServiceDto } from "@/src/shared/types/createServiceDto";
import {
  countOrdersUsingService,
  createService,
  deleteService,
  getServiceById,
  getServices,
  getServicesByCategoryId,
  updateService,
} from "../repositories/services.repositories";

function validateService(data: CreateServiceDto) {
  if (!data.category_id) {
    throw new Error("La categoría es obligatoria");
  }

  if (!data.name?.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  if (!data.unit) {
    throw new Error("La unidad de cobro es obligatoria");
  }

  if (!Number.isFinite(Number(data.price)) || Number(data.price) < 0) {
    throw new Error("El precio no es válido");
  }
}

export async function listServicesByCategory(categoryId: number) {
  return await getServicesByCategoryId(categoryId);
}

export async function createNewService(data: CreateServiceDto) {
  validateService(data);

  return createService(data);
}

export async function listServices() {
  return await getServices();
}

export async function editService(id: number, data: CreateServiceDto) {
  validateService(data);

  const service = await getServiceById(id);

  if (!service) {
    throw new Error("El servicio no existe");
  }

  return await updateService(id, data);
}

export async function removeService(id: number) {
  const service = await getServiceById(id);

  if (!service) {
    throw new Error("El servicio no existe");
  }

  // Borrarlo dejaría sin nombre los renglones de pedidos ya facturados.
  const orders = await countOrdersUsingService(id);

  if (orders > 0) {
    throw new Error(
      `No se puede eliminar: el servicio está en ${orders} ${
        orders === 1 ? "pedido" : "pedidos"
      }`,
    );
  }

  return await deleteService(id);
}
