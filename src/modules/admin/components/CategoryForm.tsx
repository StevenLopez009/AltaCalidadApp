"use client";

import { useState } from "react";

export function CategoryForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      alert("No se pudo subir la imagen");
      return;
    }

    const data = await response.json();

    console.log("Respuesta upload:", data);

    // Ejemplo: /uploads/imagen.jpg
    setImage(data.url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      console.log({
        name,
        description,
        image,
      });
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          image,
        }),
      });

      if (!response.ok) {
        throw new Error("Error creando categoría");
      }

      setName("");
      setDescription("");
      setImage("");

      alert("Categoría creada correctamente");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        max-w-xl
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-8
        backdrop-blur-xl
      "
    >
      <h2
        className="
        text-3xl
        font-black
        uppercase
        text-white
      "
      >
        Nueva categoría
      </h2>

      <div className="mt-6">
        <label className="text-sm text-white/60">Nombre</label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="
            mt-2
            w-full
            rounded-xl
            border
            border-white/10
            bg-black/40
            px-4
            py-3
            text-white
          "
        />
      </div>

      <div className="mt-5">
        <label className="text-sm text-white/60">Descripción</label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="
            mt-2
            h-32
            w-full
            rounded-xl
            border
            border-white/10
            bg-black/40
            px-4
            py-3
            text-white
          "
        />
      </div>

      <div className="mt-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="
      w-full
      rounded-xl
      border
      border-white/10
      bg-black/40
      p-3
      text-white
      file:mr-4
      file:rounded-lg
      file:border-0
      file:bg-orange-500
      file:px-4
      file:py-2
      file:font-semibold
      file:text-white
      file:hover:bg-orange-600
      cursor-pointer
    "
        />
      </div>

      <button
        disabled={loading}
        className="
          mt-8
          w-full
          rounded-xl
          bg-orange-500
          py-3
          font-bold
          uppercase
          text-white
          transition
          hover:bg-orange-600
          disabled:opacity-50
        "
      >
        {loading ? "Guardando..." : "Crear categoría"}
      </button>
    </form>
  );
}
