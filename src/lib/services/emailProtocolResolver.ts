/**
 * ============================================================================
 * RESOLUTOR QUIRÚRGICO DE PROTOCOLOS DE CORREO (POP3, IMAP, SMTP)
 * Detección Automática de Servicios Comerciales y Servidores Propios Institucionales
 * ============================================================================
 */

export type MailProtocol = 'IMAP' | 'POP3';
export type SecurityType = 'SSL_TLS' | 'STARTTLS' | 'NONE';

export interface EmailServerPreset {
  providerId: string;
  providerName: string;
  domains: string[];
  isCommercial: boolean;
  imap: {
    host: string;
    port: number;
    security: SecurityType;
  };
  pop3: {
    host: string;
    port: number;
    security: SecurityType;
  };
  smtp: {
    host: string;
    port: number;
    security: SecurityType;
  };
  notes?: string;
  requiresAppPassword?: boolean;
}

export interface EmailServerConfig {
  email: string;
  providerId: string;
  providerName: string;
  isCommercial: boolean;
  protocol: MailProtocol;
  incomingHost: string;
  incomingPort: number;
  incomingSecurity: SecurityType;
  outgoingHost: string;
  outgoingPort: number;
  outgoingSecurity: SecurityType;
  username: string;
  password?: string;
  requiresAppPassword?: boolean;
  lastConnectedAt?: string;
  connectionStatus?: 'connected' | 'error' | 'disconnected' | 'testing';
  latencyMs?: number;
  statusMessage?: string;
}

/**
 * Catálogo Maestro de Proveedores Comerciales más usados a nivel global y en México.
 */
export const COMMERCIAL_PROVIDERS: EmailServerPreset[] = [
  {
    providerId: 'google',
    providerName: 'Google Workspace / Gmail',
    domains: ['gmail.com', 'googlemail.com'],
    isCommercial: true,
    imap: {
      host: 'imap.gmail.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'pop.gmail.com',
      port: 995,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'smtp.gmail.com',
      port: 587,
      security: 'STARTTLS'
    },
    requiresAppPassword: true,
    notes: 'Requiere contraseña de aplicación de 16 caracteres si se utiliza autenticación en 2 pasos.'
  },
  {
    providerId: 'microsoft',
    providerName: 'Microsoft 365 / Outlook / Hotmail',
    domains: ['outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'office365.com', 'outlook.es'],
    isCommercial: true,
    imap: {
      host: 'outlook.office365.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'outlook.office365.com',
      port: 995,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'smtp.office365.com',
      port: 587,
      security: 'STARTTLS'
    },
    requiresAppPassword: true,
    notes: 'Soporta autenticación moderna y contraseñas de aplicación Microsoft.'
  },
  {
    providerId: 'yahoo',
    providerName: 'Yahoo Mail',
    domains: ['yahoo.com', 'yahoo.com.mx', 'yahoo.es', 'ymail.com', 'rocketmail.com'],
    isCommercial: true,
    imap: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'pop.mail.yahoo.com',
      port: 995,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'smtp.mail.yahoo.com',
      port: 465,
      security: 'SSL_TLS'
    },
    requiresAppPassword: true,
    notes: 'Generar clave de aplicación de un solo uso en la seguridad de cuenta Yahoo.'
  },
  {
    providerId: 'apple',
    providerName: 'Apple iCloud Mail',
    domains: ['icloud.com', 'me.com', 'mac.com'],
    isCommercial: true,
    imap: {
      host: 'imap.mail.me.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'imap.mail.me.com', // Apple no soporta POP3 nativo, se canaliza vía IMAP
      port: 993,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'smtp.mail.me.com',
      port: 587,
      security: 'STARTTLS'
    },
    requiresAppPassword: true,
    notes: 'Requiere contraseña específica para apps generada en appleid.apple.com.'
  },
  {
    providerId: 'zoho',
    providerName: 'Zoho Mail',
    domains: ['zoho.com', 'zohomail.com'],
    isCommercial: true,
    imap: {
      host: 'imap.zoho.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'pop.zoho.com',
      port: 995,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'smtp.zoho.com',
      port: 465,
      security: 'SSL_TLS'
    },
    requiresAppPassword: false,
    notes: 'Habilitar acceso IMAP/POP en la configuración de la cuenta de Zoho.'
  },
  {
    providerId: 'proton',
    providerName: 'Proton Mail (Bridge / Custom)',
    domains: ['proton.me', 'protonmail.com', 'pm.me'],
    isCommercial: true,
    imap: {
      host: '127.0.0.1',
      port: 1143,
      security: 'STARTTLS'
    },
    pop3: {
      host: '127.0.0.1',
      port: 1143,
      security: 'STARTTLS'
    },
    smtp: {
      host: '127.0.0.1',
      port: 1025,
      security: 'STARTTLS'
    },
    requiresAppPassword: true,
    notes: 'Proton Mail requiere Proton Bridge local para sincronización IMAP/SMTP o servidor puente.'
  },
  {
    providerId: 'gmx',
    providerName: 'GMX Mail',
    domains: ['gmx.com', 'gmx.es', 'gmx.net'],
    isCommercial: true,
    imap: {
      host: 'imap.gmx.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'pop.gmx.com',
      port: 995,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'mail.gmx.com',
      port: 587,
      security: 'STARTTLS'
    },
    notes: 'Activar acceso POP3/IMAP en la configuración web de GMX.'
  },
  {
    providerId: 'aol',
    providerName: 'AOL Mail',
    domains: ['aol.com'],
    isCommercial: true,
    imap: {
      host: 'imap.aol.com',
      port: 993,
      security: 'SSL_TLS'
    },
    pop3: {
      host: 'pop.aol.com',
      port: 995,
      security: 'SSL_TLS'
    },
    smtp: {
      host: 'smtp.aol.com',
      port: 465,
      security: 'SSL_TLS'
    },
    requiresAppPassword: true
  }
];

/**
 * Puertos estándar oficiales de la IANA para Correo Electrónico.
 */
export const STANDARD_MAIL_PORTS = {
  IMAP: [
    { port: 993, label: '993 (SSL/TLS - Seguro Recomendado)', security: 'SSL_TLS' as SecurityType },
    { port: 143, label: '143 (STARTTLS / Estándar)', security: 'STARTTLS' as SecurityType }
  ],
  POP3: [
    { port: 995, label: '995 (SSL/TLS - Seguro Recomendado)', security: 'SSL_TLS' as SecurityType },
    { port: 110, label: '110 (Estándar sin cifrado o STARTTLS)', security: 'STARTTLS' as SecurityType }
  ],
  SMTP: [
    { port: 465, label: '465 (SSL/TLS - Cifrado Seguro)', security: 'SSL_TLS' as SecurityType },
    { port: 587, label: '587 (STARTTLS - Recomendado)', security: 'STARTTLS' as SecurityType },
    { port: 25, label: '25 (Relay Estándar / No cifrado)', security: 'NONE' as SecurityType }
  ]
};

/**
 * Resuelve y auto-detecta la configuración ideal para cualquier dirección de correo electrónico.
 * Si es un servicio comercial, aplica sus servidores oficiales.
 * Si es un servidor propio o institucional, infiere los hosts más usados (mail.dominio.com, imap.dominio.com)
 * y los puertos estándar más utilizados, permitiendo su modificación quirúrgica.
 */
export function resolveEmailServerConfig(
  email: string,
  preferredProtocol: MailProtocol = 'IMAP'
): EmailServerConfig {
  const cleanEmail = (email || '').trim().toLowerCase();
  const domain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';

  // 1. Detección en Catálogo Comercial
  const matchedCommercial = COMMERCIAL_PROVIDERS.find(p => 
    p.domains.some(d => d === domain || domain.endsWith(`.${d}`))
  );

  if (matchedCommercial) {
    const isImap = preferredProtocol === 'IMAP';
    return {
      email: cleanEmail,
      providerId: matchedCommercial.providerId,
      providerName: matchedCommercial.providerName,
      isCommercial: true,
      protocol: preferredProtocol,
      incomingHost: isImap ? matchedCommercial.imap.host : matchedCommercial.pop3.host,
      incomingPort: isImap ? matchedCommercial.imap.port : matchedCommercial.pop3.port,
      incomingSecurity: isImap ? matchedCommercial.imap.security : matchedCommercial.pop3.security,
      outgoingHost: matchedCommercial.smtp.host,
      outgoingPort: matchedCommercial.smtp.port,
      outgoingSecurity: matchedCommercial.smtp.security,
      username: cleanEmail,
      requiresAppPassword: matchedCommercial.requiresAppPassword,
      statusMessage: matchedCommercial.notes || 'Configuración comercial óptima preasignada.'
    };
  }

  // 2. Servidor Propio / Institucional / Dominio Privado
  const hostDomain = domain || 'colegio.edu.mx';
  const isImap = preferredProtocol === 'IMAP';

  return {
    email: cleanEmail,
    providerId: 'custom_server',
    providerName: domain ? `Servidor Propio (${domain})` : 'Servidor de Correo Propio / Institucional',
    isCommercial: false,
    protocol: preferredProtocol,
    incomingHost: isImap ? `mail.${hostDomain}` : `mail.${hostDomain}`,
    incomingPort: isImap ? 993 : 995,
    incomingSecurity: 'SSL_TLS',
    outgoingHost: `mail.${hostDomain}`,
    outgoingPort: 465,
    outgoingSecurity: 'SSL_TLS',
    username: cleanEmail,
    requiresAppPassword: false,
    statusMessage: 'Servidor propio detectado. Puertos estándar SSL/TLS preconfigurados (modificables a discreción).'
  };
}

/**
 * Valida la consistencia de una configuración de servidor.
 */
export function validateEmailServerConfig(config: Partial<EmailServerConfig>): { valid: boolean; error?: string } {
  if (!config.email || !config.email.includes('@')) {
    return { valid: false, error: 'Dirección de correo electrónico inválida.' };
  }
  if (!config.incomingHost || config.incomingHost.trim().length < 3) {
    return { valid: false, error: 'Por favor especifique el servidor de correo entrante (Host).' };
  }
  if (!config.incomingPort || config.incomingPort <= 0 || config.incomingPort > 65535) {
    return { valid: false, error: 'Puerto entrante inválido (debe estar entre 1 y 65535).' };
  }
  if (!config.outgoingHost || config.outgoingHost.trim().length < 3) {
    return { valid: false, error: 'Por favor especifique el servidor de salida SMTP (Host).' };
  }
  if (!config.outgoingPort || config.outgoingPort <= 0 || config.outgoingPort > 65535) {
    return { valid: false, error: 'Puerto saliente SMTP inválido (debe estar entre 1 y 65535).' };
  }
  return { valid: true };
}
