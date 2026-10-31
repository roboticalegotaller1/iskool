/**
 * Datos legales públicos de ISkool y su pie de página.
 *
 * La plataforma de autenticación OAuth exige, para verificar la marca, que la
 * página principal (https://iskool.mx/) enlace a la Política de Privacidad con
 * la misma URL registrada en su consola. La portada (`components/landing`) y
 * este pie usan estas constantes. No eliminar los enlaces.
 */
export const PRIVACY_URL = "https://iskool.mx/privacidad";
export const TERMS_URL = "https://iskool.mx/terminos";
export const SUPPORT_EMAIL = "contacto@iskool.mx";

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
