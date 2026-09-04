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
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      {/* ===================================================== */}
      {/* CARRUSEL */}
      {/* ===================================================== */}

      {images.length > 0 ? (
        <div className="relative h-full w-full overflow-hidden bg-[#0a0a0c]">
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

                {/* OVERLAY INFERIOR */}
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-[#0e0e11] via-[#0e0e11]/70 to-transparent p-5 pt-16">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD21C]">
                      Carrusel
                    </p>

                    <span className="text-sm font-medium text-white">
                      Imagen {index + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(image.id)}
                    disabled={deletingId === image.id}
                    className="
                    rounded-xl
                    border border-red-500/30
                    bg-red-500/15
                    px-4 py-2
                    text-sm font-medium
                    text-red-300
                    transition
                    hover:bg-red-500/25
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                  >
                    {deletingId === image.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* ================================================= */}
          {/* CONTROLES DENTRO DEL CARRUSEL */}
          {/* ================================================= */}

          <div className="absolute right-5 top-5 z-20 flex items-center gap-2">
            {/* INPUT */}
            <label
              htmlFor="header-image"
              className="
              cursor-pointer
              rounded-xl
              border border-white/20
              bg-black/60
              px-4 py-2.5
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-white
              shadow-lg
              backdrop-blur-md
              transition
              hover:border-[#FFD21C]/60
              hover:bg-[#FFD21C]
              hover:text-black
            "
            >
              + Seleccionar imagen
            </label>

            <input
              id="header-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />

            {/* SUBIR */}
            {file && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="
                rounded-xl
                border border-[#FF7A00]/40
                bg-[#FF7A00]
                px-4 py-2.5
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-white
                shadow-[0_0_20px_rgba(255,122,0,0.35)]
                transition
                hover:bg-[#FF3030]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              >
                {uploading ? "Subiendo..." : "Subir imagen"}
              </button>
            )}
          </div>

          {/* ================================================= */}
          {/* PREVIEW DE NUEVA IMAGEN */}
          {/* ================================================= */}

          {preview && (
            <div className="absolute bottom-5 left-5 z-20 flex max-w-[280px] items-center gap-3 rounded-xl border border-[#FFD21C]/30 bg-black/70 p-2 backdrop-blur-md">
              <img
                src={preview}
                alt="Preview"
                className="h-12 w-16 rounded-lg object-cover"
              />

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-wider text-[#FFD21C]">
                  Nueva imagen
                </p>

                <p className="truncate text-xs text-white">Lista para subir</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===================================================== */
        /* SIN IMÁGENES */
        /* ===================================================== */

        <div className="relative flex h-full w-full items-center justify-center bg-[#0a0a0c]">
          <div className="text-center">
            <p className="text-sm text-zinc-400">
              No hay imágenes en el carrusel
            </p>

            <p className="mt-1 text-xs text-zinc-600">
              Selecciona una imagen para comenzar
            </p>
          </div>

          {/* BOTÓN DENTRO DEL CARRUSEL */}
          <div className="absolute right-5 top-5">
            <label
              htmlFor="header-image"
              className="
              cursor-pointer
              rounded-xl
              border border-white/20
              bg-black/60
              px-4 py-2.5
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-white
              backdrop-blur-md
              transition
              hover:border-[#FFD21C]/60
              hover:bg-[#FFD21C]
              hover:text-black
            "
            >
              + Seleccionar imagen
            </label>

            <input
              id="header-image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </div>

          {/* PREVIEW + SUBIR */}
          {preview && (
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-xl border border-[#FFD21C]/30 bg-black/70 p-3 backdrop-blur-md">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-12 w-16 rounded-lg object-cover"
                />

                <div>
                  <p className="text-[9px] font-black uppercase tracking-wider text-[#FFD21C]">
                    Nueva imagen
                  </p>

                  <p className="text-xs text-white">Lista para subir</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="
                rounded-xl
                bg-[#FF7A00]
                px-4 py-2.5
                text-xs
                font-bold
                uppercase
                tracking-wider
                text-white
                transition
                hover:bg-[#FF3030]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
              >
                {uploading ? "Subiendo..." : "Subir imagen"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
