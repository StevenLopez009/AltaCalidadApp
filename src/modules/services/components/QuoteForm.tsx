"use client";

import { useState } from "react";
import { Service } from "@/src/shared/types/service";

interface Props {
  service: Service;
  onClose: () => void;
}

export function QuoteForm({ service, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [observations, setObservations] = useState("");
  const [loading, setLoading] = useState(false);

  const total = Number(service.price) * quantity;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: service.id,
          customerName,
          phone,
          email,
          city,
          address,
          quantity,
          observations,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      alert("Cotización enviada correctamente.");

      setCustomerName("");
      setPhone("");
      setEmail("");
      setCity("");
      setAddress("");
      setObservations("");
      setQuantity(1);

      onClose();
    } catch (error) {
      console.error(error);
      alert("No se pudo enviar la cotización.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-orange-500/20 bg-black/40 p-8"
    >
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-black">Cotizar {service.name}</h2>

        <button
          onClick={onClose}
          className="rounded-lg bg-zinc-800 px-4 py-2 transition hover:bg-zinc-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5">
        {/* Cantidad */}
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            {service.unit === "m2" ? "Cantidad (m²)" : "Cantidad"}
          </label>

          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* Nombre */}
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            Nombre completo
          </label>

          <input
            type="text"
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            Teléfono
          </label>

          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* Correo */}
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            Correo electrónico
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* Ciudad */}
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            Ciudad
          </label>

          <input
            type="text"
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            Dirección de instalación
          </label>

          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>

        {/* Observaciones */}
        <div>
          <label className="text-sm font-semibold uppercase text-white/60">
            Observaciones
          </label>

          <textarea
            rows={4}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Describe tu proyecto..."
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-orange-500"
          />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/10 p-5">
        <span className="text-lg font-semibold text-white/70">
          Total aproximado
        </span>

        <strong className="text-3xl font-black text-orange-400">
          ${total.toLocaleString("es-CO")}
        </strong>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="
          mt-8
          w-full
          rounded-xl
          bg-gradient-to-r
          from-orange-500
          to-red-600
          py-4
          text-lg
          font-bold
          uppercase
          tracking-wider
          text-white
          transition
          hover:scale-[1.02]
          hover:shadow-lg
          hover:shadow-orange-500/30
          disabled:opacity-50
        "
      >
        {loading ? "Enviando..." : "Solicitar cotización"}
      </button>
    </form>
  );
}
