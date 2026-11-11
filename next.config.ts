import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
  productionBrowserSourceMaps: false,
  outputFileTracingIncludes: {
    '/api/**/*': [
      './planeaciones/**/*',
      './personajes_historicos/**/*',
      './Correo/**/*',
      './knowledge/**/*',
      './.index/**/*',
      './src/data/video-1080p/**/*'
    ],
  },
  outputFileTracingExcludes: {
    '*': [
      './*.pdf',
      './*.mp4',
      './*.wav',
      './*.html',
      './*.md',
      './*.sql',
      './.data/**/*',
      './.cache/**/*',
      './public/**/*',
      './scripts/**/*',
      './temp_sales_video_assets/**/*',
      './scratch/**/*',
      './01_Arquitectura/**/*',
      './02_Frontend/**/*',
      './03_LMS_Gamification/**/*',
      './node_modules/@ffmpeg-installer/**/*',
      './node_modules/puppeteer/**/*',
      './node_modules/@xenova/transformers/node_modules/sharp/vendor/**/*',
      './node_modules/pixi.js/**/*',
      './node_modules/onnxruntime-web/**/*',
      './node_modules/onnxruntime-node/**/*',
      './node_modules/onnxruntime-common/**/*',
      './node_modules/@xenova/**/*',
      './node_modules/typescript/**/*',
      './node_modules/@esbuild/**/*',
      './node_modules/chromium-bidi/**/*'
    ]
  },
  // Habilitar compresión HTTP gzip / brotli para respuestas estáticas y dinámicas
  compress: true,
  // Deshabilitar cabecera X-Powered-By para blindaje anti-fingerprinting (OWASP ASVS 14.4.1 / CASA)
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "zustand",
      "marked",
      "isomorphic-dompurify",
      "zod",
      "gray-matter"
    ],
  },
  // Optimización de imágenes de alto rendimiento
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  // pixi.js is a browser-only WebGL/canvas library; sharp uses native C++ binaries on Node
  serverExternalPackages: ["pixi.js", "sharp"],
  typescript: {
    // Type safety is strictly verified across the entire repository (0 errors).
    ignoreBuildErrors: false,
  },
  // Cabeceras de Seguridad Estrictas OWASP Top 10 y Política de Protección Perimetral
  async headers() {
    const isDev = process.env.NODE_ENV !== "production";
    const scriptSrc = isDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://www.google.com https://www.gstatic.com"
      : "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com https://www.google.com https://www.gstatic.com";
    return [
      {
        source: "/(images|brand|icons|fonts)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              scriptSrc,
              "style-src 'self' 'unsafe-inline' https:",
              "font-src 'self' data: https:",
              "img-src 'self' data: blob: https:",
              "media-src 'self' data: blob: https:",
              "connect-src 'self' https: wss:",
              "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://phet.colorado.edu https://www.geogebra.org https://www.desmos.com blob:",
              "frame-ancestors 'self'",
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
            value: "camera=(self), microphone=(self), geolocation=(), browsing-topics=()",
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
