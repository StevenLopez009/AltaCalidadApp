"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      console.log(response.status);
      console.log(data);

      if (!response.ok) {
        setError(data.message);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900 p-10"
      >
        <h1 className="text-4xl font-black text-white">
          Panel de Administración
        </h1>

        <p className="mt-2 text-zinc-400">Inicia sesión para continuar.</p>

        <div className="mt-8">
          <label className="mb-2 block text-sm text-zinc-300">Usuario</label>

          <input
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none focus:border-orange-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm text-zinc-300">Contraseña</label>

          <input
            type="password"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-white outline-none focus:border-orange-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="mt-4 text-red-400">{error}</p>}

        <button
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
