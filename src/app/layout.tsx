import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeSync } from "@/components/ThemeSync";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalHelpFab } from "@/components/help/GlobalHelpFab";
import { ComingSoonProvider } from "@/components/ui/ComingSoonModal";
import { TenantBrandingProvider } from "@/components/branding/TenantBrandingProvider";
import { generateServerTenantCss } from "@/lib/branding/tenantThemeTokens";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ISkool - Módulo Académico Gamificado",
  description: "Plataforma educativa interactiva alineada con la Nueva Escuela Mexicana",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverCss = generateServerTenantCss('iskool');

  return (
    <html
      lang="es"
      className={`h-full light antialiased ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      data-tenant="iskool"
      suppressHydrationWarning
    >
      <head>
        {/* Inyección SSR de tokens CSS para eliminación total de parpadeo (Zero-FOUC) */}
        <style id="server-tenant-tokens" dangerouslySetInnerHTML={{ __html: serverCss }} />
        {/* Script síncrono previo a renderizado del DOM */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var h = window.location.hostname.toLowerCase();
                  var c = document.cookie;
                  var p = window.location.pathname.toLowerCase();
                  var isIbime = h.indexOf('ibime') !== -1 || c.indexOf('ibime_session=') !== -1 || p.indexOf('/ibime') === 0;
                  if (isIbime) {
                    document.documentElement.setAttribute('data-tenant', 'ibime');
                  }
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 text-slate-900 font-sans">
        <TenantBrandingProvider>
          <ThemeSync />
          <AuthProvider>
            <ComingSoonProvider>
              {children}
              <GlobalHelpFab />
            </ComingSoonProvider>
          </AuthProvider>
        </TenantBrandingProvider>
      </body>
    </html>
  );
}


