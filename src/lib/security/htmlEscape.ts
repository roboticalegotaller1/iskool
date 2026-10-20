/**
 * @file htmlEscape.ts
 * @description Utilidad de sanitización perimetral y escape estricto de entidades HTML
 * para prevención de ataques Reflected XSS y DOM XSS en respuestas HTML y plantillas.
 */

export function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Validador estricto de rutas de redirección interna (Anti Open-Redirect).
 * Garantiza que la ruta comience con '/' y no contenga esquemas externos ni dobles barras.
 */
export function sanitizeInternalRedirectUrl(url?: string | null, defaultFallback = '/student'): string {
  if (!url || typeof url !== 'string') return defaultFallback;
  const trimmed = url.trim();
  // Rechazar esquemas externos, dobles barras, backslashes o caracteres de control
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\') || trimmed.includes('\\')) {
    return defaultFallback;
  }
  // Permitir únicamente rutas relativas seguras: /path?query=1#hash
  if (!/^\/[a-zA-Z0-9_\-\/?.=&%#]*$/.test(trimmed)) {
    return defaultFallback;
  }
  return trimmed;
}
