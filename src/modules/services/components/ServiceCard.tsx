"use client";

import { useState } from "react";
import Image from "next/image";
import { Service } from "@/src/shared/types/service";
import { QuoteForm } from "./QuoteForm";

interface Props {
  service: Service;
}

export function ServiceCard({ service }: Props) {
  const [openQuote, setOpenQuote] = useState(false);

  return (
    <article
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
      "
    >
      {!openQuote ? (
        <>
          <div className="relative h-64 overflow-hidden">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-zinc-800">
                Sin imagen
              </div>
            )}
          </div>

          <div className="p-8">
            <h3 className="text-2xl font-bold uppercase">{service.name}</h3>

            <p className="mt-4 text-white/70">{service.description}</p>

            <div className="mt-8 flex justify-between">
              <div>
                <p className="text-sm text-white/40">Precio</p>

                <p className="text-3xl font-black text-orange-400">
                  ${Number(service.price).toLocaleString("es-CO")}
                </p>
              </div>

              <span>{service.unit}</span>
            </div>

            <button
              onClick={() => setOpenQuote(true)}
              className="mt-8 w-full rounded-xl bg-orange-500 py-3 font-bold text-white"
            >
              Cotizar servicio
            </button>
          </div>
        </>
      ) : (
        <QuoteForm service={service} onClose={() => setOpenQuote(false)} />
      )}
    </article>
  );
}
