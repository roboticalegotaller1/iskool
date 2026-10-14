import fs from 'fs';
import path from 'path';

export interface CorreoDelegatedMatter {
  id: string;
  matter_code: string;
  title: string;
  summary: string;
  category: string;
  urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  destination: string;
  why_shown: string;
  reincidence_count: number;
  recommended_action: string;
  suggested_draft_reply?: string;
  assigned_role: string;
  assigned_email: string;
  delegate_name?: string;
  sla_hours: number;
  sla_remaining_text?: string;
  sender_name: string;
  sender_email: string;
  provenance_doc: string;
  received_at: string;
  delegated_at?: string;
  campus?: string;
}

/**
 * Obtiene la carpeta aislada de la Bóveda de Correo correspondiente a la cuenta/tenant autenticado.
 * REGLA: Cada escuela o cuenta almacena exclusivamente en Correo/[Carpeta] garantizando aislamiento total.
 */
export function getTenantCorreoDir(tenantIdOrAccount?: string): string {
  const root = path.join(process.cwd(), 'Correo');
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const raw = (tenantIdOrAccount || 'IBIME').trim();
  let folder = 'IBIME';

  if (raw === 'e1000000-0000-0000-0000-000000000001' || raw.toLowerCase().includes('ibime')) {
    folder = 'IBIME';
  } else if (raw === 'e2000000-0000-0000-0000-000000000002' || raw.toLowerCase().includes('iskool')) {
    folder = 'iSkool';
  } else if (raw.includes('99999999-9999') || raw.toLowerCase().includes('sandbox') || raw.toLowerCase().includes('guest')) {
    folder = 'sandbox';
  } else {
    // Sanitizar nombre de cuenta o tenant para evitar path traversal
    folder = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 32);
  }

  const tenantDir = path.join(root, folder);
  if (!fs.existsSync(tenantDir)) {
    fs.mkdirSync(tenantDir, { recursive: true });
  }

  return tenantDir;
}

/**
 * Carga la lista de Asuntos Delegados con SLA para la cuenta/tenant desde Correo/[Tenant]/Asuntos_Delegados_Con_SLA.json
 */
export function getDelegatedMattersFromCorreoVault(tenantIdOrAccount: string): CorreoDelegatedMatter[] {
  try {
    const tenantDir = getTenantCorreoDir(tenantIdOrAccount);
    const jsonPath = path.join(tenantDir, 'Asuntos_Delegados_Con_SLA.json');
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, 'utf8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[CorreoVaultService] Error al leer Asuntos_Delegados_Con_SLA.json:', err);
  }
  return [];
}

/**
 * Persiste un asunto delegado en la Bóveda de Correo aislada de la cuenta (Correo/[Tenant]/Asuntos_Delegados_Con_SLA.json)
 * y además genera un registro Markdown individual en Correo/[Tenant]/delegados/[ID].md con frontmatter institucional.
 */
export function saveDelegatedMatterToCorreoVault(
  tenantIdOrAccount: string,
  matter: CorreoDelegatedMatter
): { success: boolean; totalDelegated: number; matterCode: string } {
  try {
    const tenantDir = getTenantCorreoDir(tenantIdOrAccount);
    const jsonPath = path.join(tenantDir, 'Asuntos_Delegados_Con_SLA.json');
    
    let current: CorreoDelegatedMatter[] = [];
    if (fs.existsSync(jsonPath)) {
      try {
        current = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (!Array.isArray(current)) current = [];
      } catch {
        current = [];
      }
    }

    // Actualizar o agregar
    const existingIndex = current.findIndex(m => m.id === matter.id || m.matter_code === matter.matter_code);
    const updatedMatter: CorreoDelegatedMatter = {
      ...matter,
      delegated_at: matter.delegated_at || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      current[existingIndex] = updatedMatter;
    } else {
      current.unshift(updatedMatter);
    }

    fs.writeFileSync(jsonPath, JSON.stringify(current, null, 2), 'utf8');

    // Registro individual en Markdown en subcarpeta delegados/
    const delegadosFolder = path.join(tenantDir, 'delegados');
    if (!fs.existsSync(delegadosFolder)) {
      fs.mkdirSync(delegadosFolder, { recursive: true });
    }

    const safeFileCode = (matter.matter_code || matter.id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const mdPath = path.join(delegadosFolder, `${safeFileCode}.md`);
    const mdContent = `---
expediente: "${matter.matter_code}"
titulo: "${matter.title.replace(/"/g, '\\"')}"
remitente: "${matter.sender_name} <${matter.sender_email}>"
area_asignada: "${matter.assigned_role}"
delegado: "${matter.delegate_name || matter.assigned_role} <${matter.assigned_email}>"
sla_horas: ${matter.sla_hours}
fecha_delegacion: "${updatedMatter.delegated_at}"
plantel: "${matter.campus || 'Matriz'}"
categoria: "${matter.category}"
urgencia: "${matter.urgency}"
normativa_origen: "${matter.provenance_doc}"
---

# Expediente Delegado: ${matter.matter_code}
**Asunto:** ${matter.title}
**Fecha:** ${matter.received_at}

## Resumen Ejecutivo del Asunto
${matter.summary}

## Instrucción de Dirección General
Asignado con SLA estricto de **${matter.sla_hours} horas** a **${matter.assigned_role}** (${matter.assigned_email}).
`;

    fs.writeFileSync(mdPath, mdContent, 'utf8');

    return {
      success: true,
      totalDelegated: current.length,
      matterCode: matter.matter_code
    };
  } catch (err) {
    console.error('[CorreoVaultService] Error al guardar asunto delegado:', err);
    throw err;
  }
}
