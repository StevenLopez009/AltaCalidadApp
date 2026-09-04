import { CreateCompanyDto } from "@/src/shared/types/createCompanyDto";
import {
  createCompany,
  deleteCompany,
  getCompanies,
} from "../repositories/company.repositories";

export async function listCompanies() {
  return await getCompanies();
}

export async function createNewCompany(data: CreateCompanyDto) {
  return await createCompany(data);
}

export async function deleteCompanyById(id: number) {
  return await deleteCompany(id);
}
