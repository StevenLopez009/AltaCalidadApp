"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

const fallbackSlides: CarouselImage[] = [
  {
    id: 1,
    image_url:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1400&auto=format&fit=crop",
    sort_order: 1,
    active: true,
  },
  {
    id: 2,
    image_url:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1400&auto=format&fit=crop",
    sort_order: 2,
    active: true,
  },
];

export function CarruselSection() {
  const [slides, setSlides] = useState<CarouselImage[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    async function loadSlides() {
      try {
        const response = await fetch("/api/header-carousel");
        if (!response.ok) throw new Error("Error al obtener slides");
        const data: CarouselImage[] = await response.json();
        if (data && data.length > 0) {
          setSlides(data);
        } else {
          setSlides(fallbackSlides);
        }
      } catch (error) {
        console.error("Usando datos de respaldo por error en API:", error);
        setSlides(fallbackSlides);
      }
    }

    loadSlides();
  }, []);

  if (!isMounted || slides.length === 0) {
    return (
      <section className="relative w-full bg-[#080808]">
        <div className="mx-auto max-w-[1440px]">
          <div className="h-[520px] md:h-[650px] w-full rounded-3xl bg-[#121212] animate-pulse border border-white/5" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative pt-8 pb-12 px-4 md:px-8 bg-[#080808]">
      {/* Luces de fondo ambientales muy sutiles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-[#FF7A00]/10 blur-[160px]" />
      </div>

      <div className="relative w-full">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#121212] shadow-2xl">
          <Swiper
            modules={[Autoplay, Pagination, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            loop={slides.length > 1}
            speed={900}
            autoplay={{
              delay: 6000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{
              clickable: true,
              el: ".custom-carousel-pagination",
            }}
            className="h-[520px] md:h-[650px] w-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={`${slide.id}-${index}`}>
                <div className="relative h-full w-full overflow-hidden bg-black">
                  {/* IMAGEN */}
                  <div className="absolute inset-0">
                    <Image
                      src={slide.image_url}
                      alt={`Gran Calidad Slide ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="100vw"
                      className="object-cover animate-fade-in"
                    />
                  </div>

                  {/* Velo inferior para que el botón Login sea legible */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* ÚNICO ELEMENTO SOBRE LA IMAGEN */}
                  <div className="absolute bottom-6 left-6 z-20 md:bottom-8 md:left-8">
                    <Link
                      href="/admin/login"
                      className="rounded-xl bg-gradient-to-r from-[#FFD21F] via-[#FF7A00] to-[#E50914] px-7 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Paginación minimalista flotante */}
          <div className="custom-carousel-pagination absolute bottom-6 right-8 z-30 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-md" />
        </div>
      </div>

      <style jsx global>{`
        .custom-carousel-pagination .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          margin: 0 !important;
          opacity: 0.3;
          background: #ffffff;
          transition: all 0.3s ease;
          border-radius: 4px;
        }

        .custom-carousel-pagination .swiper-pagination-bullet-active {
          width: 24px;
          opacity: 1;
          background: #ffd21f;
          box-shadow: 0 0 10px rgba(255, 210, 31, 0.5);
        }
      `}</style>
    </section>
  );
}
