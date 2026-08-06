import slugify from "slugify";
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
} from "../repositories/categories.repositories";
import { CreateCategoryDto } from "../shared/types/createCategoryDto";

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
