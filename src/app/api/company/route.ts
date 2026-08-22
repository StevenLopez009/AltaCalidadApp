import {
  createNewCompany,
  listCompanies,
} from "@/src/modules/company/services/company.service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const companies = await listCompanies();

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error obteniendo empresas:", error);

    return NextResponse.json(
      { message: "Error obteniendo empresas" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const company = await createNewCompany({
      nameCompany: body.nameCompany,
      discountPercentage: Number(body.discountPercentage),
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("Error creando empresa:", error);

    return NextResponse.json(
      { message: "Error creando empresa" },
      { status: 500 },
    );
  }
}
