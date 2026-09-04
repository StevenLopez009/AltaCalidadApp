import {
  createNewCompany,
  deleteCompanyById,
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

    // Validación básica
    if (!body.nameCompany || !body.telefono) {
      return NextResponse.json(
        {
          message: "El nombre de la empresa y el teléfono son obligatorios",
        },
        { status: 400 },
      );
    }

    const company = await createNewCompany({
      nameCompany: body.nameCompany,
      telefono: body.telefono,
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

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const id = Number(body.id);

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          message: "El ID de la empresa es obligatorio",
        },
        {
          status: 400,
        },
      );
    }

    await deleteCompanyById(id);

    return NextResponse.json({
      message: "Empresa eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando empresa:", error);

    return NextResponse.json(
      {
        message: "Error eliminando empresa",
      },
      {
        status: 500,
      },
    );
  }
}
