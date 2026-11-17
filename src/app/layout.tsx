import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeSync } from "@/components/ThemeSync";
import { AuthProvider } from "@/context/AuthContext";
import { ClientFloatingShell } from "@/components/layout/ClientFloatingShell";
import { ComingSoonProvider } from "@/components/ui/ComingSoonModal";
import { TenantBrandingProvider } from "@/components/branding/TenantBrandingProvider";
import { NavigationTracker } from "@/components/navigation/NavigationTracker";
import { generateServerTenantCss } from "@/lib/branding/tenantThemeTokens";
import { TenantId } from "@/lib/auth/multiTenantSession";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const resolvedTenant = (headersList.get('x-resolved-tenant') as TenantId) || 'iskool';
  const isIbime = resolvedTenant === 'ibime';

  return {
    metadataBase: new URL('https://iskool.mx'),
    title: isIbime
      ? 'IBIME · Ecosistema Académico Institucional'
      : 'ISkool - Módulo Académico Gamificado',
    description: isIbime
      ? 'Portal institucional del Instituto Bilingüe IBIME conectado a la Nueva Escuela Mexicana'
      : 'Plataforma educativa interactiva alineada con la Nueva Escuela Mexicana',
    icons: {
      icon: isIbime ? '/brand/ibime_favicon.png' : '/brand/iskool-icono.png',
      apple: isIbime ? '/brand/ibime_favicon.png' : '/brand/iskool-icono.png',
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: isIbime ? 'IBIME' : 'ISkool',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    },
    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" }
  ]
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const resolvedTenant = (headersList.get('x-resolved-tenant') as TenantId) || 'iskool';
  const serverCss = generateServerTenantCss(resolvedTenant);

  return (
    <html
      lang="es"
      className="h-full light antialiased"
      data-tenant={resolvedTenant}
      suppressHydrationWarning
    >
      <head>
        {/* Inyección SSR de tokens CSS para eliminación total de parpadeo (Zero-FOUC) */}
        <style id="server-tenant-tokens" dangerouslySetInnerHTML={{ __html: serverCss }} />
      </head>
      <body
        className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-slate-50 text-slate-900 font-sans"
        data-tenant={resolvedTenant}
      >
        <TenantBrandingProvider initialTenant={resolvedTenant}>
          <ThemeSync />
          <AuthProvider>
            <NavigationTracker />
            <ComingSoonProvider>
              {children}
              <ClientFloatingShell />
            </ComingSoonProvider>
          </AuthProvider>
        </TenantBrandingProvider>
      </body>
    </html>
  );
}
