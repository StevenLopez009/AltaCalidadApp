import slugify from "slugify";
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  updateCategory,
  deleteCategory,
  countServicesUsingCategory,
  countMaterialsUsingCategory,
  countOrderItemsUsingCategory,
} from "../repositories/categories.repositories";
import { CreateCategoryDto } from "@/src/shared/types/createCategoryDto";

export async function listCategories() {
  return await getCategories();
}

export async function findCategoryBySlug(slug: string) {
  return await getCategoryBySlug(slug);
}

export async function createNewCategory(data: CreateCategoryDto) {
  const slug = slugify(data.name, {
    lower: true,
    strict: true,
  });

  return createCategory({
    ...data,
    slug,
  });
}

export async function editCategory(
  id: number,
  data: { name: string; description: string; image: string },
) {
  const category = await getCategoryById(id);

  if (!category) {
    throw new Error("La categoría no existe");
  }

  if (!data.name.trim()) {
    throw new Error("El nombre es obligatorio");
  }

  const slug = slugify(data.name, { lower: true, strict: true });

  return updateCategory(id, {
    name: data.name.trim(),
    description: data.description.trim(),
    image: data.image,
    slug,
  });
}

export async function removeCategory(id: number) {
  const category = await getCategoryById(id);

  if (!category) {
    throw new Error("La categoría no existe");
  }

  const [services, materials, orderItems] = await Promise.all([
    countServicesUsingCategory(id),
    countMaterialsUsingCategory(id),
    countOrderItemsUsingCategory(id),
  ]);

  const usages: string[] = [];

  if (services > 0) {
    usages.push(`${services} ${services === 1 ? "servicio" : "servicios"}`);
  }

  if (materials > 0) {
    usages.push(`${materials} ${materials === 1 ? "material" : "materiales"}`);
  }

  if (orderItems > 0) {
    usages.push(
      `${orderItems} ${orderItems === 1 ? "ítem de pedido" : "ítems de pedido"}`,
    );
  }

  if (usages.length > 0) {
    throw new Error(
      `No se puede eliminar: la categoría está en uso por ${usages.join(" y ")}`,
    );
  }

  return deleteCategory(id);
}
