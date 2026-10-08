export * from './ceoEmailSettingsTypes';
import {
  VipEmailRule,
  SectionDelegateConfig,
  OfficialTemplateConfig,
  CeoEmailSettings,
  getDefaultVipRules,
  getDefaultDelegates,
  getDefaultOfficialTemplates,
  getDefaultSettings
} from './ceoEmailSettingsTypes';

function getNodeFs() {
  if (typeof window === 'undefined') {
    try {
      const nodeFs = eval('require')('fs');
      const nodePath = eval('require')('path');
      return { fs: nodeFs, path: nodePath };
    } catch {
      return null;
    }
  }
  return null;
}

// Memoria global compartida entre peticiones y hot-reloads
const memoryStore: Map<string, CeoEmailSettings> =
  (globalThis as any).__iskoolCeoEmailSettingsStore ||
  ((globalThis as any).__iskoolCeoEmailSettingsStore = new Map());

function loadFromDisk(): Map<string, CeoEmailSettings> {
  const map = new Map<string, CeoEmailSettings>();
  const node = getNodeFs();
  if (!node) return map;
  try {
    const settingsDir = node.path.join(process.cwd(), '.data');
    const settingsFile = node.path.join(settingsDir, 'ceo_email_settings.json');
    if (node.fs.existsSync(settingsFile)) {
      const raw = node.fs.readFileSync(settingsFile, 'utf8');
      const data = JSON.parse(raw);
      if (typeof data === 'object' && data !== null) {
        for (const [tenantId, settings] of Object.entries(data)) {
          if (settings && typeof settings === 'object') {
            map.set(tenantId, settings as CeoEmailSettings);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error al leer configuraciones CEO desde disco:', err);
  }
  return map;
}

function saveToDisk(map: Map<string, CeoEmailSettings>) {
  const node = getNodeFs();
  if (!node) return;
  try {
    const settingsDir = node.path.join(process.cwd(), '.data');
    const settingsFile = node.path.join(settingsDir, 'ceo_email_settings.json');
    if (!node.fs.existsSync(settingsDir)) {
      node.fs.mkdirSync(settingsDir, { recursive: true });
    }
    const obj: Record<string, CeoEmailSettings> = {};
    for (const [tenantId, settings] of map.entries()) {
      obj[tenantId] = settings;
    }
    node.fs.writeFileSync(settingsFile, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error al persistir configuraciones CEO en disco:', err);
  }
}

// Inicializar desde disco si el mapa está vacío
if (memoryStore.size === 0) {
  const loaded = loadFromDisk();
  for (const [k, v] of loaded.entries()) {
    memoryStore.set(k, v);
  }
}

export const CeoEmailSettingsService = {
  /**
   * Obtiene la configuración completa para un tenant (VIP, delegados y plantillas)
   */
  getSettings(tenantId: string): CeoEmailSettings {
    const cleanId = (tenantId || 'e1000000-0000-0000-0000-000000000001').trim();
    let current = memoryStore.get(cleanId);

    if (!current) {
      current = {
        tenantId: cleanId,
        vipEmails: getDefaultVipRules(cleanId),
        delegates: getDefaultDelegates(cleanId),
        templates: getDefaultOfficialTemplates(cleanId),
        updatedAt: new Date().toISOString()
      };
      memoryStore.set(cleanId, current);
      saveToDisk(memoryStore);
    }

    return current;
  },

  /**
   * Actualiza la configuración completa o parcial de un tenant
   */
  updateSettings(tenantId: string, updates: Partial<CeoEmailSettings>): CeoEmailSettings {
    const cleanId = (tenantId || 'e1000000-0000-0000-0000-000000000001').trim();
    const existing = this.getSettings(cleanId);

    const merged: CeoEmailSettings = {
      ...existing,
      ...updates,
      tenantId: cleanId,
      updatedAt: new Date().toISOString()
    };

    memoryStore.set(cleanId, merged);
    saveToDisk(memoryStore);
    return merged;
  },

  /**
   * Verifica si un correo remitente está registrado y activo en la lista VIP
   */
  isVipEmail(tenantId: string, senderEmail?: string): boolean {
    if (!senderEmail) return false;
    const cleanEmail = senderEmail.toLowerCase().trim();
    const settings = this.getSettings(tenantId);

    return settings.vipEmails.some(rule => {
      if (!rule.enabled) return false;
      const target = rule.email.toLowerCase().trim();
      return cleanEmail === target || cleanEmail.includes(target) || (target.startsWith('@') && cleanEmail.endsWith(target));
    });
  },

  /**
   * Obtiene la regla VIP coincidente para un correo
   */
  getMatchingVipRule(tenantId: string, senderEmail?: string): VipEmailRule | undefined {
    if (!senderEmail) return undefined;
    const cleanEmail = senderEmail.toLowerCase().trim();
    const settings = this.getSettings(tenantId);

    return settings.vipEmails.find(rule => {
      if (!rule.enabled) return false;
      const target = rule.email.toLowerCase().trim();
      return cleanEmail === target || cleanEmail.includes(target) || (target.startsWith('@') && cleanEmail.endsWith(target));
    });
  },

  /**
   * Agrega un nuevo correo a la lista VIP
   */
  addVipEmail(tenantId: string, rule: Omit<VipEmailRule, 'id' | 'createdAt'>): VipEmailRule {
    const settings = this.getSettings(tenantId);
    const newRule: VipEmailRule = {
      ...rule,
      id: `vip-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    settings.vipEmails.push(newRule);
    this.updateSettings(tenantId, { vipEmails: settings.vipEmails });
    return newRule;
  },

  /**
   * Elimina un correo de la lista VIP
   */
  removeVipEmail(tenantId: string, ruleId: string): boolean {
    const settings = this.getSettings(tenantId);
    const initialLen = settings.vipEmails.length;
    settings.vipEmails = settings.vipEmails.filter(r => r.id !== ruleId && r.email !== ruleId);
    if (settings.vipEmails.length !== initialLen) {
      this.updateSettings(tenantId, { vipEmails: settings.vipEmails });
      return true;
    }
    return false;
  },

  /**
   * Modifica el delegado asignado a una sección
   */
  updateDelegate(
    tenantId: string,
    sectionKey: string,
    updates: Partial<Pick<SectionDelegateConfig, 'delegateName' | 'delegateEmail' | 'slaHours' | 'autoNotify'>>
  ): SectionDelegateConfig | null {
    const settings = this.getSettings(tenantId);
    const delegate = settings.delegates.find(d => d.sectionKey === sectionKey || d.id === sectionKey);
    if (!delegate) return null;

    Object.assign(delegate, updates);
    this.updateSettings(tenantId, { delegates: settings.delegates });
    return delegate;
  },

  /**
   * Encuentra el delegado correspondiente para un asunto o texto dado
   */
  resolveDelegateForText(tenantId: string, text: string): SectionDelegateConfig | undefined {
    const lower = text.toLowerCase();
    const settings = this.getSettings(tenantId);

    // Búsqueda por palabras clave configuradas
    for (const del of settings.delegates) {
      if (del.keywords.some(k => lower.includes(k.toLowerCase()))) {
        return del;
      }
    }
    return settings.delegates[0]; // Fallback al primer delegado (Cobranza / Administrativo)
  },

  /**
   * Guarda una plantilla personalizada como la predeterminada oficial
   */
  saveCustomDefaultTemplate(
    tenantId: string,
    templateId: string,
    subject: string,
    body: string
  ): OfficialTemplateConfig | null {
    const aliasMap: Record<string, string> = {
      circular_general: 'tpl-circular',
      citatorio_convivencia: 'tpl-salvaguarda',
      facturacion_cfdi: 'tpl-cobranza',
      transporte_rutas: 'tpl-transporte',
      supervision_sep: 'tpl-cte',
      reunion_cte: 'tpl-cte'
    };
    const canonicalId = aliasMap[templateId] || templateId;

    const settings = this.getSettings(tenantId);
    const tpl = settings.templates.find(t => t.id === canonicalId || t.id === templateId);
    if (!tpl) return null;

    tpl.defaultSubject = subject;
    tpl.defaultBody = body;
    tpl.isCustomDefault = true;
    tpl.lastModifiedAt = new Date().toISOString();

    this.updateSettings(tenantId, { templates: settings.templates });
    return tpl;
  },

  /**
   * Restablece una plantilla a su redacción predeterminada de fábrica
   */
  resetTemplateToDefault(tenantId: string, templateId: string): OfficialTemplateConfig | null {
    const aliasMap: Record<string, string> = {
      circular_general: 'tpl-circular',
      citatorio_convivencia: 'tpl-salvaguarda',
      facturacion_cfdi: 'tpl-cobranza',
      transporte_rutas: 'tpl-transporte',
      supervision_sep: 'tpl-cte',
      reunion_cte: 'tpl-cte'
    };
    const canonicalId = aliasMap[templateId] || templateId;

    const defaultTemplates = getDefaultOfficialTemplates(tenantId);
    const standard = defaultTemplates.find(t => t.id === canonicalId || t.id === templateId);
    if (!standard) return null;

    const settings = this.getSettings(tenantId);
    const tpl = settings.templates.find(t => t.id === canonicalId || t.id === templateId);
    if (!tpl) return null;

    tpl.defaultSubject = standard.defaultSubject;
    tpl.defaultBody = standard.defaultBody;
    tpl.isCustomDefault = false;
    tpl.lastModifiedAt = new Date().toISOString();

    this.updateSettings(tenantId, { templates: settings.templates });
    return tpl;
  },

  /**
   * Restablece todas las configuraciones del tenant a su estado original de fábrica
   */
  resetAllToDefault(tenantId: string): CeoEmailSettings {
    const defaultSettings: CeoEmailSettings = {
      tenantId,
      vipEmails: getDefaultVipRules(tenantId),
      delegates: getDefaultDelegates(tenantId),
      templates: getDefaultOfficialTemplates(tenantId),
      updatedAt: new Date().toISOString()
    };
    memoryStore.set(tenantId, defaultSettings);
    saveToDisk(memoryStore);
    return defaultSettings;
  }
};
