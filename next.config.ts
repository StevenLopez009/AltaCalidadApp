import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

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
