import {
  createService,
  getServicesByCategoryId,
} from "../repositories/services.repositories";

export async function listServicesByCategory(categoryId: number) {
  return await getServicesByCategoryId(categoryId);
}

export async function createNewService(data: CreateServiceDto) {
  return createService(data);
}
