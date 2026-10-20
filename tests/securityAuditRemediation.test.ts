import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeInternalRedirectUrl } from '@/lib/security/htmlEscape';
import { isPrivateOrReservedIp, validateMailTarget, ALLOWED_MAIL_PORTS } from '@/lib/security/ssrfValidator';
import { signOAuthState, verifyOAuthState } from '@/lib/security/oauthState';

describe('Auditoría de Seguridad: Sanitización y Escape Anti-XSS', () => {
  it('debe escapar correctamente caracteres peligrosos de HTML (<, >, &, ", \')', () => {
    const maliciousPayload = '<script>alert("XSS")</script>';
    const escaped = escapeHtml(maliciousPayload);
    expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    expect(escaped).not.toContain('<script>');
  });

  it('debe manejar entradas nulas, indefinidas y numéricas sin errores', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
    expect(escapeHtml(12345)).toBe('12345');
  });

  it('debe escapar comillas simples y dobles para prevenir inyección en atributos HTML', () => {
    const attrPayload = '" onfocus="alert(1)" foo=\'bar\'';
    const escaped = escapeHtml(attrPayload);
    expect(escaped).toContain('&quot;');
    expect(escaped).toContain('&#39;');
    expect(escaped).not.toContain('" onfocus=');
  });
});

describe('Auditoría de Seguridad: Prevención de Open Redirect', () => {
  it('debe permitir rutas relativas legítimas del sistema', () => {
    expect(sanitizeInternalRedirectUrl('/admin')).toBe('/admin');
    expect(sanitizeInternalRedirectUrl('/teacher?tab=plannings')).toBe('/teacher?tab=plannings');
    expect(sanitizeInternalRedirectUrl('/student#courses')).toBe('/student#courses');
  });

  it('debe bloquear esquemas externos y URLs absolutas', () => {
    expect(sanitizeInternalRedirectUrl('https://evil.com')).toBe('/student');
    expect(sanitizeInternalRedirectUrl('http://attacker.com/login')).toBe('/student');
    expect(sanitizeInternalRedirectUrl('javascript:alert(1)')).toBe('/student');
  });

  it('debe bloquear bypasses de barra doble y backslash (protocol-relative)', () => {
    expect(sanitizeInternalRedirectUrl('//evil.com')).toBe('/student');
    expect(sanitizeInternalRedirectUrl('/\\evil.com')).toBe('/student');
    expect(sanitizeInternalRedirectUrl('\\evil.com')).toBe('/student');
  });
});

describe('Auditoría de Seguridad: Prevención de SSRF y Restricción de Puertos', () => {
  it('debe detectar y bloquear IPs de Loopback y Metadatos de Cloud', () => {
    expect(isPrivateOrReservedIp('127.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('127.0.1.10')).toBe(true);
    expect(isPrivateOrReservedIp('169.254.169.254')).toBe(true); // AWS / GCP Metadata
    expect(isPrivateOrReservedIp('0.0.0.0')).toBe(true);
    expect(isPrivateOrReservedIp('::1')).toBe(true);
  });

  it('debe detectar y bloquear rangos privados RFC 1918', () => {
    expect(isPrivateOrReservedIp('10.0.0.1')).toBe(true);
    expect(isPrivateOrReservedIp('172.16.0.5')).toBe(true);
    expect(isPrivateOrReservedIp('172.31.255.255')).toBe(true);
    expect(isPrivateOrReservedIp('192.168.1.100')).toBe(true);
  });

  it('debe permitir IPs públicas legítimas', () => {
    expect(isPrivateOrReservedIp('8.8.8.8')).toBe(false);
    expect(isPrivateOrReservedIp('142.250.190.46')).toBe(false); // Google Public
  });

  it('debe rechazar hostnames internos y puertos no autorizados', () => {
    expect(validateMailTarget('localhost', 993).valid).toBe(false);
    expect(validateMailTarget('metadata.google.internal', 993).valid).toBe(false);
    expect(validateMailTarget('smtp.gmail.com', 22).valid).toBe(false); // SSH port
    expect(validateMailTarget('smtp.gmail.com', 80).valid).toBe(false); // HTTP port
    expect(validateMailTarget('smtp.gmail.com', 3000).valid).toBe(false); // Node port
  });

  it('debe aceptar servidores de correo y puertos estándar', () => {
    expect(validateMailTarget('smtp.gmail.com', 465).valid).toBe(true);
    expect(validateMailTarget('imap.gmail.com', 993).valid).toBe(true);
    expect(validateMailTarget('correo.institucional.edu.mx', 587).valid).toBe(true);
  });
});

describe('Auditoría de Seguridad: Integridad Criptográfica de Estado OAuth (Anti-CSRF)', () => {
  it('debe generar y verificar exitosamente un estado OAuth firmado', () => {
    const payload = {
      flow: 'login' as const,
      tenantId: 'sch-ibime',
      email: 'directora@ibime.edu.mx',
      redirect: '/ibime/portal'
    };
    const signed = signOAuthState(payload);
    expect(signed).toContain('.');

    const verification = verifyOAuthState(signed);
    expect(verification.valid).toBe(true);
    expect(verification.payload?.flow).toBe('login');
    expect(verification.payload?.tenantId).toBe('sch-ibime');
    expect(verification.payload?.redirect).toBe('/ibime/portal');
  });

  it('debe rechazar estados manipulados o con firma alterada', () => {
    const signed = signOAuthState({ flow: 'login', tenantId: 'iskool' });
    const [data, sig] = signed.split('.');
    const tampered = `${data}.${sig.slice(0, -4)}abcd`;

    const verification = verifyOAuthState(tampered);
    expect(verification.valid).toBe(false);
  });
});
