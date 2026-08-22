import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { db } from "@/src/shared/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        image_url,
        sort_order,
        active,
        created_at
      FROM header_carousel
      WHERE active = TRUE
      ORDER BY sort_order ASC, id ASC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error obteniendo imágenes del carrusel:", error);

    return NextResponse.json(
      {
        message: "Error obteniendo las imágenes del carrusel",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { image_url } = body;

    if (!image_url) {
      return NextResponse.json(
        {
          message: "La URL de la imagen es obligatoria",
        },
        { status: 400 },
      );
    }

    const [orderRows] = await db.query(`
      SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order
      FROM header_carousel
    `);

    const nextOrder = (orderRows as { next_order: number }[])[0].next_order;

    const [result] = await db.execute(
      `
      INSERT INTO header_carousel
        (image_url, sort_order, active)
      VALUES (?, ?, TRUE)
      `,
      [image_url, nextOrder],
    );

    return NextResponse.json(
      {
        success: true,
        id: (result as { insertId: number }).insertId,
        image_url,
        sort_order: nextOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error guardando imagen del carrusel:", error);

    return NextResponse.json(
      {
        message: "Error guardando la imagen del carrusel",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          message: "El id de la imagen es obligatorio",
        },
        { status: 400 },
      );
    }

    const [rows] = await db.execute(
      `
      SELECT image_url
      FROM header_carousel
      WHERE id = ?
      `,
      [id],
    );

    const images = rows as { image_url: string }[];

    if (images.length === 0) {
      return NextResponse.json(
        {
          message: "La imagen no existe",
        },
        { status: 404 },
      );
    }

    const imageUrl = images[0].image_url;

    if (imageUrl.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", imageUrl);

      try {
        await unlink(filePath);
      } catch (error: any) {
        if (error.code !== "ENOENT") {
          console.error("Error eliminando archivo:", error);

          return NextResponse.json(
            {
              message: "No se pudo eliminar el archivo físico",
            },
            { status: 500 },
          );
        }
      }
    }

    await db.execute(
      `
      DELETE FROM header_carousel
      WHERE id = ?
      `,
      [id],
    );

    return NextResponse.json({
      success: true,
      message: "Imagen eliminada correctamente",
    });
  } catch (error) {
    console.error("Error eliminando imagen:", error);

    return NextResponse.json(
      {
        message: "Error eliminando la imagen",
      },
      { status: 500 },
    );
  }
}
