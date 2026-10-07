import { describe, it, expect } from 'vitest';
import {
  resolveEmailServerConfig,
  validateEmailServerConfig,
  COMMERCIAL_PROVIDERS,
  STANDARD_MAIL_PORTS
} from '@/lib/services/emailProtocolResolver';

describe('⚡ SUITE DE PROTOCOLOS UNIVERSALES DE CORREO POP3, IMAP Y SMTP (CEO MULTI-COLEGIO)', () => {
  describe('1. Detección Automática de Servicios Comerciales más usados', () => {
    it('debe detectar Google Workspace y Gmail (@gmail.com) con IMAP 993 y SMTP 587', () => {
      const config = resolveEmailServerConfig('direccion@gmail.com', 'IMAP');
      expect(config.isCommercial).toBe(true);
      expect(config.providerId).toBe('google');
      expect(config.providerName).toContain('Google Workspace');
      expect(config.incomingHost).toBe('imap.gmail.com');
      expect(config.incomingPort).toBe(993);
      expect(config.incomingSecurity).toBe('SSL_TLS');
      expect(config.outgoingHost).toBe('smtp.gmail.com');
      expect(config.outgoingPort).toBe(587);
      expect(config.outgoingSecurity).toBe('STARTTLS');
    });

    it('debe soportar POP3 para Gmail (@gmail.com) configurando el puerto 995', () => {
      const config = resolveEmailServerConfig('rectoria@gmail.com', 'POP3');
      expect(config.isCommercial).toBe(true);
      expect(config.protocol).toBe('POP3');
      expect(config.incomingHost).toBe('pop.gmail.com');
      expect(config.incomingPort).toBe(995);
      expect(config.incomingSecurity).toBe('SSL_TLS');
    });

    it('debe detectar Microsoft 365 / Outlook (@outlook.com, @hotmail.com) con sus servidores oficiales', () => {
      const configOutlook = resolveEmailServerConfig('ceo@outlook.com', 'IMAP');
      expect(configOutlook.isCommercial).toBe(true);
      expect(configOutlook.providerId).toBe('microsoft');
      expect(configOutlook.incomingHost).toBe('outlook.office365.com');
      expect(configOutlook.incomingPort).toBe(993);
      expect(configOutlook.outgoingHost).toBe('smtp.office365.com');
      expect(configOutlook.outgoingPort).toBe(587);

      const configHotmail = resolveEmailServerConfig('director@hotmail.com', 'POP3');
      expect(configHotmail.isCommercial).toBe(true);
      expect(configHotmail.incomingHost).toBe('outlook.office365.com');
      expect(configHotmail.incomingPort).toBe(995);
    });

    it('debe detectar Yahoo Mail (@yahoo.com, @yahoo.com.mx) con IMAP 993 y SMTP 465', () => {
      const config = resolveEmailServerConfig('academico@yahoo.com.mx', 'IMAP');
      expect(config.isCommercial).toBe(true);
      expect(config.providerId).toBe('yahoo');
      expect(config.incomingHost).toBe('imap.mail.yahoo.com');
      expect(config.incomingPort).toBe(993);
      expect(config.outgoingHost).toBe('smtp.mail.yahoo.com');
      expect(config.outgoingPort).toBe(465);
    });

    it('debe detectar Apple iCloud (@icloud.com, @me.com)', () => {
      const config = resolveEmailServerConfig('titular@icloud.com', 'IMAP');
      expect(config.isCommercial).toBe(true);
      expect(config.providerId).toBe('apple');
      expect(config.incomingHost).toBe('imap.mail.me.com');
      expect(config.incomingPort).toBe(993);
    });

    it('debe detectar Zoho Mail (@zoho.com)', () => {
      const config = resolveEmailServerConfig('admin@zoho.com', 'IMAP');
      expect(config.isCommercial).toBe(true);
      expect(config.providerId).toBe('zoho');
      expect(config.incomingHost).toBe('imap.zoho.com');
      expect(config.incomingPort).toBe(993);
    });
  });

  describe('2. Servidor Propio / Institucional y Puertos Estándar más Usados', () => {
    it('debe configurar servidor propio con puertos estándar IMAP (993) para colegios (@ibime.edu.mx)', () => {
      const config = resolveEmailServerConfig('directora.general@ibime.edu.mx', 'IMAP');
      expect(config.isCommercial).toBe(false);
      expect(config.providerId).toBe('custom_server');
      expect(config.providerName).toContain('ibime.edu.mx');
      expect(config.incomingHost).toBe('mail.ibime.edu.mx');
      expect(config.incomingPort).toBe(993);
      expect(config.incomingSecurity).toBe('SSL_TLS');
      expect(config.outgoingHost).toBe('mail.ibime.edu.mx');
      expect(config.outgoingPort).toBe(465);
      expect(config.outgoingSecurity).toBe('SSL_TLS');
    });

    it('debe configurar servidor propio con puertos estándar POP3 (995) para cualquier dominio institucional', () => {
      const config = resolveEmailServerConfig('director@colegio-mexico.edu.mx', 'POP3');
      expect(config.isCommercial).toBe(false);
      expect(config.protocol).toBe('POP3');
      expect(config.incomingHost).toBe('mail.colegio-mexico.edu.mx');
      expect(config.incomingPort).toBe(995);
      expect(config.incomingSecurity).toBe('SSL_TLS');
    });

    it('debe proveer el catálogo IANA oficial de puertos más usados (IMAP 993/143, POP3 995/110, SMTP 465/587/25)', () => {
      expect(STANDARD_MAIL_PORTS.IMAP.map(p => p.port)).toEqual([993, 143]);
      expect(STANDARD_MAIL_PORTS.POP3.map(p => p.port)).toEqual([995, 110]);
      expect(STANDARD_MAIL_PORTS.SMTP.map(p => p.port)).toEqual([465, 587, 25]);
    });
  });

  describe('3. Validación Quirúrgica de Modificaciones por el Usuario', () => {
    it('debe rechazar correos sin formato válido', () => {
      const res = validateEmailServerConfig({
        email: 'correo-invalido',
        incomingHost: 'mail.servidor.com',
        incomingPort: 993,
        outgoingHost: 'mail.servidor.com',
        outgoingPort: 587
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('inválida');
    });

    it('debe rechazar puertos fuera del rango 1-65535', () => {
      const res = validateEmailServerConfig({
        email: 'admin@colegio.edu.mx',
        incomingHost: 'mail.colegio.edu.mx',
        incomingPort: 99999,
        outgoingHost: 'mail.colegio.edu.mx',
        outgoingPort: 587
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Puerto entrante');
    });

    it('debe aprobar configuraciones completas y quirúrgicas', () => {
      const res = validateEmailServerConfig({
        email: 'ceo@servidor-propio.com',
        incomingHost: 'imap.servidor-propio.com',
        incomingPort: 993,
        outgoingHost: 'smtp.servidor-propio.com',
        outgoingPort: 587
      });
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });
  });
});
