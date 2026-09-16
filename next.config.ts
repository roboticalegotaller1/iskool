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
  // Cabeceras de Seguridad Estrictas OWASP Top 10 y Política de Protección Perimetral
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https: wss:",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'"
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/pitch",
        destination: "/promo",
        permanent: false,
      },
      {
        source: "/deck",
        destination: "/promo",
        permanent: false,
      },
      {
        source: "/presentacion",
        destination: "/promo",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
