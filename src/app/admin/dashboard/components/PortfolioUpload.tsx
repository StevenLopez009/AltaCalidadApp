"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AlertTriangle, ImagePlus, Trash2, Upload } from "lucide-react";

interface PortfolioImage {
  id: number;
  image_url: string;
  title: string | null;
}

export default function PortfolioUpload() {
  const [images, setImages] = useState<PortfolioImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/portfolio");

      if (!response.ok) {
        throw new Error("No se pudo cargar el portafolio");
      }

      setImages(await response.json());
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Error cargando",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function handleSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploaded = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploaded.message ?? "No se pudo subir la imagen");
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: uploaded.url, title }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "No se pudo guardar la imagen");
      }

      setFile(null);
      setPreview("");
      setTitle("");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      await load();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(image: PortfolioImage) {
    if (!confirm("¿Eliminar esta imagen del portafolio?")) {
      return;
    }

    try {
      setDeletingId(image.id);
      setError(null);

      const response = await fetch("/api/portfolio", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.message ?? "No se pudo eliminar");
      }

      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la imagen",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="text-[#f7f4ed]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">Portafolio</h2>

        <p className="mt-1 text-xs text-zinc-500">
          Imágenes de trabajos que se muestran en la página principal
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#FF3030]/30 bg-[#FF3030]/10 px-3 py-2.5 text-xs text-[#ff8f8f]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* SUBIR */}
      <div className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[#FFD21C]/40 bg-[#FFD21C]/[0.06] px-4 py-3 text-xs font-bold text-[#FFD21C] transition hover:bg-[#FFD21C]/15"
          >
            <ImagePlus className="h-4 w-4" />
            {file ? "Cambiar imagen" : "Seleccionar imagen"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleSelect}
            className="hidden"
          />

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Título (opcional). Ej: Pendones"
            className="min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/30 px-3 py-2.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-[#FFD21C]/40"
          />

          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#FFD21C] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#111] transition hover:bg-[#FF7A00] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Subiendo..." : "Subir"}
          </button>
        </div>

        {preview && (
          <div className="mt-3 flex items-center gap-3">
            {/* Vista previa local: aún no está en el servidor. */}
            <img
              src={preview}
              alt="Vista previa"
              className="h-16 w-20 rounded-lg object-cover"
            />

            <span className="truncate text-[11px] text-zinc-500">
              {file?.name}
            </span>
          </div>
        )}
      </div>

      {/* GALERÍA */}
      {loading ? (
        <p className="py-6 text-center text-xs text-zinc-600">
          Cargando imágenes...
        </p>
      ) : images.length === 0 ? (
        <p className="py-8 text-center text-xs text-zinc-600">
          Todavía no hay imágenes. Las que subas aparecerán en el portafolio de
          la página principal.
        </p>
      ) : (
        <>
          <p className="mb-3 text-[11px] text-zinc-500">
            {images.length}{" "}
            {images.length === 1 ? "imagen publicada" : "imágenes publicadas"}
          </p>

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image) => (
              <li
                key={image.id}
                className="group relative overflow-hidden rounded-xl border border-white/[0.07] bg-black/30"
              >
                <div className="relative aspect-[3/4] w-full">
                  <Image
                    src={image.image_url}
                    alt={image.title ?? "Trabajo del portafolio"}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>

                {image.title && (
                  <p className="truncate px-2.5 py-2 text-[11px] text-zinc-400">
                    {image.title}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(image)}
                  disabled={deletingId === image.id}
                  aria-label="Eliminar imagen"
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-zinc-300 backdrop-blur transition hover:bg-[#FF3030] hover:text-white disabled:opacity-40"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
