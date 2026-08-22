"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface CarouselImage {
  id: number;
  image_url: string;
  sort_order: number;
  active: boolean;
}

export default function HeaderCarouselUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [images, setImages] = useState<CarouselImage[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ==========================================
  // CARGAR IMÁGENES DEL CARRUSEL
  // ==========================================

  async function loadImages() {
    try {
      const response = await fetch("/api/header-carousel");

      if (!response.ok) {
        throw new Error("Error cargando las imágenes");
      }

      const data: CarouselImage[] = await response.json();

      setImages(data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  // ==========================================
  // SELECCIONAR IMAGEN
  // ==========================================

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);

    const previewUrl = URL.createObjectURL(selectedFile);

    setPreview(previewUrl);
  }

  // ==========================================
  // SUBIR IMAGEN
  // ==========================================

  async function handleUpload() {
    if (!file) {
      alert("Selecciona una imagen");
      return;
    }

    try {
      setUploading(true);

      // ------------------------------------------
      // 1. SUBIR ARCHIVO
      // ------------------------------------------

      const formData = new FormData();

      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Error al subir la imagen");
      }

      const imageUrl = uploadData.url;

      // ------------------------------------------
      // 2. GUARDAR EN HEADER_CAROUSEL
      // ------------------------------------------

      const carouselResponse = await fetch("/api/header-carousel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
        }),
      });

      const carouselData = await carouselResponse.json();

      if (!carouselResponse.ok) {
        throw new Error(carouselData.message || "Error guardando la imagen");
      }

      // ------------------------------------------
      // 3. RECARGAR CARRUSEL
      // ------------------------------------------

      await loadImages();

      // Limpiar selección
      setFile(null);
      setPreview(null);

      alert("Imagen agregada correctamente");
    } catch (error) {
      console.error("Error:", error);

      alert(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setUploading(false);
    }
  }

  // ==========================================
  // ELIMINAR IMAGEN
  // ==========================================

  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta imagen?",
    );

    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      const response = await fetch("/api/header-carousel", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error eliminando la imagen");
      }

      // Actualizar carrusel inmediatamente
      setImages((currentImages) =>
        currentImages.filter((image) => image.id !== id),
      );
    } catch (error) {
      console.error("Error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* ========================================
          CARRUSEL
      ======================================== */}

      {images.length > 0 ? (
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-purple-500/20 bg-black/20">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{
              crossFade: true,
            }}
            loop={images.length > 1}
            speed={700}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            className="h-full w-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={image.id} className="relative h-full w-full">
                <img
                  src={image.image_url}
                  alt={`Imagen ${index + 1}`}
                  className="h-full w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent p-5 pt-12">
                  <span className="text-sm font-medium text-white">
                    Imagen {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    className="rounded-xl bg-red-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === image.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-purple-500/30 bg-black/10">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              No hay imágenes en el carrusel
            </p>

            <p className="mt-1 text-xs text-gray-600">
              Selecciona una imagen para comenzar
            </p>
          </div>
        </div>
      )}

      {/* ========================================
          PREVIEW NUEVA IMAGEN
      ======================================== */}

      {preview && (
        <div className="relative h-24 shrink-0 overflow-hidden rounded-xl border border-purple-500/20">
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-lg bg-black/60 px-3 py-1 text-xs text-white">
              Nueva imagen
            </span>
          </div>
        </div>
      )}

      {/* ========================================
          CONTROLES
      ======================================== */}

      <div className="flex shrink-0 items-center gap-3">
        <label
          htmlFor="header-image"
          className="cursor-pointer rounded-xl bg-purple-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-purple-700"
        >
          Seleccionar imagen
        </label>

        <input
          id="header-image"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {file && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : "Subir al carrusel"}
          </button>
        )}
      </div>
    </div>
  );
}
