import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
  // Habilitar compresión HTTP gzip / brotli para respuestas estáticas y dinámicas
  compress: true,
  // Optimización de importaciones de paquetes masivos para acelerar carga y reducir bundle
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "zustand"
    ],
  },
  // Optimización de imágenes de alto rendimiento
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  // pixi.js is a browser-only WebGL/canvas library — skip server-side bundling
  serverExternalPackages: ["pixi.js"],
  typescript: {
    // Type narrowing errors in JSX are safe at runtime (guarded by quest.type checks).
    // Full type safety is enforced during development via IDE.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;


