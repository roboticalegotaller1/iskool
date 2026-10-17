import Link from "next/link";
import { Trophy, Users, BookOpen, ShieldCheck } from "lucide-react";
import { ISkoolOfficialLogo } from "@/components/brand/ISkoolOfficialLogo";

/**
 * Página de inicio pública de ISkool (https://iskool.mx/).
 *
 * Se muestra a cualquier visitante sin sesión (y durante la carga inicial),
 * para que la página principal sea accesible sin iniciar sesión. Es un
 * requisito de la plataforma de autenticación OAuth para verificar la marca:
 * la página principal debe describir la app y enlazar a la Política de
 * Privacidad con la misma URL registrada en la consola de OAuth.
 * No eliminar los enlaces del pie de página.
 */
export const PRIVACY_URL = "https://iskool.mx/privacidad";
export const TERMS_URL = "https://iskool.mx/terminos";
export const SUPPORT_EMAIL = "roboticalegotaller1@gmail.com";

const features = [
  {
    icon: BookOpen,
    title: "Docentes",
    text: "Planeaciones alineadas a la Nueva Escuela Mexicana, misiones y evaluación de evidencias en un solo lugar.",
  },
  {
    icon: Trophy,
    title: "Alumnos",
    text: "Aprendizaje gamificado con misiones, logros y un portafolio digital de evidencias.",
  },
  {
    icon: Users,
    title: "Padres de familia",
    text: "Seguimiento del avance, comunicados y pagos escolares desde cualquier dispositivo.",
  },
  {
    icon: ShieldCheck,
    title: "Directivos",
    text: "Control escolar, coordinación académica y reportes para escuelas privadas.",
  },
];

export function PublicLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 font-sans">
      <header className="w-full border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <ISkoolOfficialLogo variant="emblem_only" theme="light" size={32} />
            <span className="text-xl font-bold tracking-tight">ISkool</span>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-16">
        <section className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900">
            ISkool: la plataforma para escuelas privadas en México
          </h1>
          <p className="mt-5 text-base text-zinc-600 leading-relaxed">
            ISkool conecta a alumnos, docentes, padres de familia y directivos en una sola
            aplicación web y móvil: aprendizaje gamificado alineado a la Nueva Escuela Mexicana,
            planeaciones, control escolar y comunicación con las familias.
          </p>
          <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
            Los usuarios inician sesión con su cuenta institucional. ISkool solo usa el nombre,
            el correo electrónico y la foto de perfil para identificar a cada usuario dentro de su
            escuela. Consulta los detalles en nuestra{" "}
            <a href={PRIVACY_URL} className="text-blue-600 underline">Política de Privacidad</a>.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
            >
              Entrar a ISkool
            </Link>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <h2 className="mt-3 font-bold text-zinc-900">{title}</h2>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{text}</p>
            </div>
          ))}
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
      <nav aria-label="Enlaces legales" className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-3">
        <a href={PRIVACY_URL} className="hover:text-zinc-900 underline">Política de Privacidad</a>
        <a href={TERMS_URL} className="hover:text-zinc-900 underline">Condiciones del Servicio</a>
        <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-zinc-900 underline">Contacto</a>
      </nav>
      © 2026 ISkool. Todos los derechos reservados.
    </footer>
  );
}
