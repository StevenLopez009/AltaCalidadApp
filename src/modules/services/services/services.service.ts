import { CreateServiceDto } from "@/src/shared/types/createServiceDto";
import {
  createService,
  getServices,
  getServicesByCategoryId,
} from "../repositories/services.repositories";

export async function listServicesByCategory(categoryId: number) {
  return await getServicesByCategoryId(categoryId);
}

export async function createNewService(data: CreateServiceDto) {
  return createService(data);
}

export async function listServices() {
  return await getServices();
}
