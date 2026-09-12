import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

/**
 * Sirve los archivos subidos en tiempo de ejecución.
 *
 * Con `output: standalone` Next solo sirve como estáticos los archivos que
 * había en /public al construir la imagen, así que todo lo que se suba después
 * daría 404. Un rewrite manda /uploads/* aquí cuando el archivo no existía en
 * el build.
 */

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await params;

    const filePath = path.join(UPLOADS_DIR, ...segments);

    // Impide salir del directorio de subidas con rutas como ../../etc/passwd
    if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
      return new NextResponse("No encontrado", { status: 404 });
    }

    const extension = path.extname(filePath).toLowerCase();

    const contentType = CONTENT_TYPES[extension];

    if (!contentType) {
      return new NextResponse("No encontrado", { status: 404 });
    }

    const info = await stat(filePath);

    if (!info.isFile()) {
      return new NextResponse("No encontrado", { status: 404 });
    }

    const file = await readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(info.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Error sirviendo archivo subido:", error);
    }

    return new NextResponse("No encontrado", { status: 404 });
  }
}
