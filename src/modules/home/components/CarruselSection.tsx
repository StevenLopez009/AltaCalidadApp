"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

export function CarruselSection() {
  const [slides, setSlides] = useState<CarouselImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSlides() {
      try {
        const response = await fetch("/api/header-carousel");

        if (!response.ok) {
          throw new Error("No se pudieron cargar las imágenes del carrusel");
        }

        const data: CarouselImage[] = await response.json();

        setSlides(data);
      } catch (error) {
        console.error("Error cargando carrusel:", error);
      } finally {
        setLoading(false);
      }
    }

    loadSlides();
  }, []);

  if (loading) {
    return null;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <Swiper
      modules={[Autoplay, Pagination, EffectFade]}
      effect="fade"
      fadeEffect={{
        crossFade: true,
      }}
      loop={slides.length > 1}
      speed={900}
      autoplay={{
        delay: 4000,
        disableOnInteraction: false,
      }}
      pagination={{
        clickable: true,
      }}
      className="h-screen w-screen"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={slide.id} className="w-full">
          <div className="relative h-full w-full">
            <Image
              src={slide.image_url}
              alt={`Slide ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
