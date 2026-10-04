import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  // El servidor de producción tiene 512 MB de RAM: el chequeo de tipos por sí
  // solo agota la memoria y el build entra en thrashing de swap. Se omite solo
  // cuando el Dockerfile lo pide; en local y CI el chequeo sigue corriendo.
  typescript: {
    ignoreBuildErrors: process.env.SKIP_TYPE_CHECK === "1",
  },

  experimental: {
    webpackMemoryOptimizations: true,
  },

  // Se evalúa después del sistema de archivos: las imágenes que ya existían al
  // construir se sirven como estáticas y las subidas después caen en la ruta
  // que las lee del disco.
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/uploads/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
