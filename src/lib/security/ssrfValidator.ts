/**
 * @file ssrfValidator.ts
 * @description Módulo de defensa en profundidad contra Server-Side Request Forgery (SSRF)
 * y escaneo no autorizado de puertos/servicios internos de infraestructura.
 */

import net from 'net';

export const ALLOWED_MAIL_PORTS = new Set([25, 465, 587, 993, 995, 110, 143]);

/**
 * Evalúa si una dirección IP o nombre de host es una dirección interna/privada o reservada.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim().toLowerCase();

  // IPv6 Loopback o Local
  if (clean === '::1' || clean === '::' || clean.startsWith('fe80:') || clean.startsWith('fc00:') || clean.startsWith('fd00:')) {
    return true;
  }

  // IPv4 Loopback, Link-Local y Privadas
  const ipv4Match = clean.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const [_, o1, o2, o3, o4] = ipv4Match.map(Number);
    if (o1 > 255 || o2 > 255 || o3 > 255 || o4 > 255) return true;

    // 0.0.0.0/8
    if (o1 === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (o1 === 127) return true;
    // 10.0.0.0/8 (RFC 1918)
    if (o1 === 10) return true;
    // 172.16.0.0/12 (RFC 1918)
    if (o1 === 172 && o2 >= 16 && o2 <= 31) return true;
    // 192.168.0.0/16 (RFC 1918)
    if (o1 === 192 && o2 === 168) return true;
    // 169.254.0.0/16 (Link-Local / Cloud Metadata AWS/GCP/Azure)
    if (o1 === 169 && o2 === 254) return true;
    // 100.64.0.0/10 (Carrier-Grade NAT)
    if (o1 === 100 && o2 >= 64 && o2 <= 127) return true;
    // 224.0.0.0/4 (Multicast) y 240.0.0.0/4 (Reservado)
    if (o1 >= 224) return true;
  }

  return false;
}

/**
 * Validador estricto para servidores de correo saliente / entrante (SMTP / IMAP / POP3)
 */
export function validateMailTarget(
  host: string,
  port: number
): { valid: boolean; reason?: string } {
  if (!host || typeof host !== 'string') {
    return { valid: false, reason: 'El host de correo es requerido y debe ser una cadena válida.' };
  }

  const cleanHost = host.trim().toLowerCase();

  // Hostnames prohibidos
  const prohibitedHosts = [
    'localhost',
    'metadata.google.internal',
    'instance-data',
    'internal',
    'local'
  ];

  if (
    prohibitedHosts.includes(cleanHost) ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.internal')
  ) {
    return { valid: false, reason: `Conexión a "${cleanHost}" bloqueada por directiva perimetral anti-SSRF.` };
  }

  // Si el host es una dirección IP directa, validar rangos
  if (net.isIP(cleanHost)) {
    if (isPrivateOrReservedIp(cleanHost)) {
      return { valid: false, reason: `Dirección IP privada o reservada ("${cleanHost}") bloqueada por política de seguridad.` };
    }
  }

  // Validar puerto
  const numericPort = Number(port);
  if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65535) {
    return { valid: false, reason: `Puerto inválido: ${port}.` };
  }

  if (!ALLOWED_MAIL_PORTS.has(numericPort)) {
    return {
      valid: false,
      reason: `Puerto ${numericPort} no admitido para servicios de correo institucional. Solo se admiten puertos estándar: ${Array.from(ALLOWED_MAIL_PORTS).join(', ')}.`
    };
  }

  return { valid: true };
}
