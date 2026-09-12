import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

import {
  createPortfolioImage,
  deletePortfolioImage,
  getPortfolioImageById,
  getPortfolioImages,
} from "@/src/modules/home/repositories/portfolio.repositories";

export async function GET() {
  try {
    return NextResponse.json(await getPortfolioImages());
  } catch (error) {
    console.error("Error obteniendo el portafolio:", error);

    return NextResponse.json(
      { message: "Error obteniendo las imágenes del portafolio" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const imageUrl = String(body.image_url ?? "").trim();

    if (!imageUrl) {
      return NextResponse.json(
        { message: "La URL de la imagen es obligatoria" },
        { status: 400 },
      );
    }

    const title = String(body.title ?? "").trim();

    const { result, sortOrder } = await createPortfolioImage({
      imageUrl,
      title: title || null,
    });

    return NextResponse.json(
      {
        success: true,
        id: result.insertId,
        image_url: imageUrl,
        title: title || null,
        sort_order: sortOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error guardando imagen del portafolio:", error);

    return NextResponse.json(
      { message: "Error guardando la imagen" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    const imageId = Number(id);

    if (!Number.isInteger(imageId) || imageId <= 0) {
      return NextResponse.json(
        { message: "El id de la imagen es obligatorio" },
        { status: 400 },
      );
    }

    const image = await getPortfolioImageById(imageId);

    if (!image) {
      return NextResponse.json(
        { message: "La imagen no existe" },
        { status: 404 },
      );
    }

    // Solo se borran del disco los archivos que subió el propio panel.
    if (image.image_url.startsWith("/uploads/")) {
      try {
        await unlink(path.join(process.cwd(), "public", image.image_url));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error("Error eliminando archivo:", error);
        }
      }
    }

    await deletePortfolioImage(imageId);

    return NextResponse.json({
      success: true,
      message: "Imagen eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando imagen del portafolio:", error);

    return NextResponse.json(
      { message: "Error eliminando la imagen" },
      { status: 500 },
    );
  }
}
