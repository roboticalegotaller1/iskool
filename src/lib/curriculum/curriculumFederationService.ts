import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  TenantId,
  CurriculumPlan,
  CreateOrExtendPlanInput,
  UserAuditContext,
  CurriculumCatalogFilter,
  CurriculumExportPackage
} from './types';
import { PedagogicalPiiGuard, PedagogicalPrivacyViolationError } from '../institutionalMemory/piiGuard';

/**
 * ============================================================================
 * SERVICIO DE FEDERACIÓN E INTEROPERABILIDAD CURRICULAR (iSkool Core & IBIME)
 * Arquitectura de Bóveda Hermética con Resolución Jerárquica (Overlay Pattern)
 * ============================================================================
 */

export class CurriculumFederationService {
  // Almacén en memoria indexado por TenantId -> (PlanId -> CurriculumPlan)
  private static plansByTenant = new Map<TenantId, Map<string, CurriculumPlan>>();
  private static initialized = false;

  /**
   * Inicializa el catálogo base de iSkool y los overlays existentes
   */
  public static initialize(): void {
    if (this.initialized) return;

    this.plansByTenant.set('iskool', new Map());
    this.plansByTenant.set('ibime', new Map());

    // Cargar catálogo inicial de iSkool Core (NEM 2024 / Fases 2 a 6)
    this.seedCentralIskoolCatalog();
    this.initialized = true;
  }

  /**
   * Catálogo canónico de referencia de iSkool Core
   */
  private static seedCentralIskoolCatalog(): void {
    const iskoolMap = this.plansByTenant.get('iskool')!;

    const basePlans: CurriculumPlan[] = [
      {
        id: 'plan-nem-f4-g4-cie-001',
        tenant_id: 'iskool',
        title: 'Cuidado y Filtración del Agua en la Comunidad Escolar',
        subject_code: 'ciencias',
        phase: 4,
        grade: 4,
        curriculum_standard: {
          framework: 'NEM 2024',
          pda_code: 'PDA-CIE-F4-4TO-035',
          pda_description: 'Indaga el ciclo hidrológico, las propiedades físicas del agua y diseña prototipos de filtración y captación pluvial.'
        },
        didactic_intent: 'Investigar los cambios de estado físico del agua y construir un prototipo ecotécnico comunitario.',
        sessions: [
          {
            session_number: 1,
            duration_minutes: 50,
            moments: {
              inicio: 'Pregunta detonadora sobre la disponibilidad del agua potable y lluvia en el entorno escolar.',
              desarrollo: 'Experimentación en equipos con recipientes, evaporación y condensación.',
              cierre: 'Registro en la bitácora científica y síntesis grupal en el Lienzo Digital interactivo.'
            }
          }
        ],
        evaluation_rubric: [
          {
            criterion: 'Comprensión del ciclo y filtración del agua',
            weight_percent: 50,
            descriptors: {
              sobresaliente: 'Explica con rigor científico las fases del ciclo hidrológico y el funcionamiento de la filtración.',
              satisfactorio: 'Identifica las etapas principales del agua con apoyo de esquemas visuales.',
              en_proceso: 'Confunde los cambios de estado líquido a gaseoso y requiere andamiaje docente.'
            }
          },
          {
            criterion: 'Diseño colaborativo de la ecotecnia escolar',
            weight_percent: 50,
            descriptors: {
              sobresaliente: 'Construye un prototipo funcional con materiales reutilizados y reporta datos cuantitativos.',
              satisfactorio: 'Participa activamente en el ensamblaje del filtro casero siguiendo instrucciones.',
              en_proceso: 'Muestra dificultad para trabajar en equipo y el prototipo presenta fugas.'
            }
          }
        ],
        audit_trail: {
          author_id: 'usr-core-pedagogy',
          author_name: 'Comité Curricular iSkool',
          author_role: 'director',
          author_email: 'pedagogia@iskool.edu.mx',
          institution_cct: '09DPR0000Z',
          tenant_id: 'iskool',
          created_at: '2026-09-01T08:00:00Z',
          updated_at: '2026-09-01T08:00:00Z',
          signature_sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b'
        },
        vault_node_ref: 'planeaciones/Primaria_Fase_4/4to_Grado/Ciencias_Naturales/Planeacion_F4-CIE-4TO-V00035_Ciclo_del_agua_cambios_de_estado_y_.md',
        is_custom_overlay: false
      },
      {
        id: 'plan-nem-f5-g5-mat-002',
        tenant_id: 'iskool',
        title: 'Fracciones Equivalentes y Representación en la Recta Numérica',
        subject_code: 'matematicas',
        phase: 5,
        grade: 5,
        curriculum_standard: {
          framework: 'NEM 2024',
          pda_code: 'PDA-MAT-F5-5TO-012',
          pda_description: 'Resuelve situaciones problemáticas que implican comparar y ordenar fracciones con denominadores distintos.'
        },
        didactic_intent: 'Comprender el concepto de equivalencia fraccionaria mediante modelos gráficos y regletas.',
        sessions: [
          {
            session_number: 1,
            duration_minutes: 50,
            moments: {
              inicio: 'Reparto simulado de panes y terrenos entre diferentes números de personas.',
              desarrollo: 'Construcción de tiras fraccionarias y comprobación en el Lienzo Digital.',
              cierre: 'Resolución de desafío en parejas con retroalimentación instantánea.'
            }
          }
        ],
        evaluation_rubric: [
          {
            criterion: 'Razonamiento fraccionario',
            weight_percent: 60,
            descriptors: {
              sobresaliente: 'Identifica y justifica equivalencias fraccionarias con múltiples representaciones.',
              satisfactorio: 'Calcula fracciones equivalentes multiplicando o dividiendo por el mismo factor.',
              en_proceso: 'Suma numeradores y denominadores de forma lineal cometiendo errores de proporción.'
            }
          }
        ],
        audit_trail: {
          author_id: 'usr-core-pedagogy',
          author_name: 'Comité Curricular iSkool',
          author_role: 'director',
          author_email: 'pedagogia@iskool.edu.mx',
          institution_cct: '09DPR0000Z',
          tenant_id: 'iskool',
          created_at: '2026-09-01T08:00:00Z',
          updated_at: '2026-09-01T08:00:00Z',
          signature_sha256: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
        },
        vault_node_ref: 'planeaciones/Primaria_Fase_5/5to_Grado/Matematicas/Fracciones_Equivalentes.md',
        is_custom_overlay: false
      }
    ];

    for (const plan of basePlans) {
      iskoolMap.set(plan.id, plan);
    }
  }

  // ==========================================================================
  // CONSULTAS FEDERADAS CON RESOLUCIÓN JERÁRQUICA (OVERLAY PATTERN)
  // ==========================================================================

  /**
   * Consulta el catálogo central (iSkool Core) en modo sólo lectura.
   */
  public static async getCentralCatalog(filter?: CurriculumCatalogFilter): Promise<CurriculumPlan[]> {
    this.initialize();
    const centralMap = this.plansByTenant.get('iskool')!;
    let plans = Array.from(centralMap.values());
    return this.applyFilter(plans, filter);
  }

  /**
   * Consulta los planes accesibles para un Tenant específico aplicando resolución jerárquica:
   * - Para IBIME: Entrega planes de iSkool Core, pero si IBIME tiene una versión personalizada (overlay),
   *   reemplaza el plan por la versión institucional de IBIME.
   * - Para iSkool: Entrega estrictamente las planeaciones de iSkool Core sin contaminación de IBIME.
   */
  public static async getPlansForTenant(
    tenantId: TenantId,
    filter?: CurriculumCatalogFilter
  ): Promise<CurriculumPlan[]> {
    this.initialize();

    if (tenantId === 'iskool') {
      return this.getCentralCatalog(filter);
    }

    // Tenant IBIME: Resolución Jerárquica
    const centralPlans = Array.from(this.plansByTenant.get('iskool')!.values());
    const ibimeMap = this.plansByTenant.get('ibime')!;
    const ibimePlans = Array.from(ibimeMap.values());

    // Mapeo de Overlays por parent_plan_id
    const overlayByParent = new Map<string, CurriculumPlan>();
    const standaloneIbimePlans: CurriculumPlan[] = [];

    for (const p of ibimePlans) {
      if (p.parent_plan_id) {
        overlayByParent.set(p.parent_plan_id, p);
      } else {
        standaloneIbimePlans.push(p);
      }
    }

    // Fusión Jerárquica: Priorizar overlay de IBIME sobre el plan base de iSkool
    const resolvedPlans: CurriculumPlan[] = [];

    for (const basePlan of centralPlans) {
      if (overlayByParent.has(basePlan.id)) {
        resolvedPlans.push(overlayByParent.get(basePlan.id)!);
      } else {
        // Hereda el plan canónico de iSkool en modo lectura
        resolvedPlans.push({
          ...basePlan,
          is_custom_overlay: false
        });
      }
    }

    // Agregar planes originales y exclusivos creados por IBIME
    resolvedPlans.push(...standaloneIbimePlans);

    return this.applyFilter(resolvedPlans, filter);
  }

  /**
   * Resuelve una planeación individual por ID según el contexto del Tenant.
   */
  public static async resolvePlan(planId: string, tenantId: TenantId): Promise<CurriculumPlan | null> {
    this.initialize();

    if (tenantId === 'ibime') {
      const ibimeMap = this.plansByTenant.get('ibime')!;
      // 1. Buscar si IBIME tiene el plan con ese ID directo
      if (ibimeMap.has(planId)) {
        return ibimeMap.get(planId)!;
      }
      // 2. Buscar si existe un overlay de IBIME para un parent_plan_id
      for (const plan of ibimeMap.values()) {
        if (plan.parent_plan_id === planId) {
          return plan;
        }
      }
    }

    // 3. Fallback al catálogo central de iSkool
    const centralMap = this.plansByTenant.get('iskool')!;
    const centralPlan = centralMap.get(planId);
    return centralPlan ? { ...centralPlan, is_custom_overlay: false } : null;
  }

  // ==========================================================================
  // PERSISTENCIA HERMÉTICA, EXTENSIÓN Y AUDITORÍA DOCENTE
  // ==========================================================================

  /**
   * Guarda o extiende una planeación en el namespace propio del Tenant,
   * garantizando que NUNCA sobreescriba ni desordene los planes de iSkool Core.
   */
  public static async saveOrExtendPlan(
    input: CreateOrExtendPlanInput,
    userContext: UserAuditContext
  ): Promise<CurriculumPlan> {
    this.initialize();

    // 1. Guarda Cripto-Pedagógica: Escaneo de PII
    const textToScan = [
      input.title,
      input.didactic_intent,
      JSON.stringify(input.sessions),
      JSON.stringify(input.evaluation_rubric),
      JSON.stringify(input.bicultural_adaptations || {})
    ].join(' ');

    const piiResult = PedagogicalPiiGuard.scan(textToScan);
    if (piiResult.hasPii) {
      throw new PedagogicalPrivacyViolationError(
        'Se detectaron datos personales o identificadores de alumnos en la planeación curricular.',
        piiResult.violations
      );
    }

    // 2. Definir IDs y relaciones de herencia
    const tenantId = userContext.tenant_id;
    const isOverlay = Boolean(input.parent_plan_id && tenantId === 'ibime');
    const planId = input.id || (isOverlay ? `ibime-overlay-${input.parent_plan_id}` : `plan-${tenantId}-${crypto.randomUUID().slice(0, 8)}`);

    const nowIso = new Date().toISOString();

    // 3. Generación de Checksum Criptográfico de Auditoría Docente (SHA-256)
    const auditPayload = `${planId}|${tenantId}|${userContext.user_id}|${userContext.email}|${input.curriculum_standard.pda_description}|${nowIso}`;
    const signature = crypto.createHash('sha256').update(auditPayload).digest('hex');

    const auditTrail = {
      author_id: userContext.user_id,
      author_name: userContext.name,
      author_role: userContext.role,
      author_email: userContext.email,
      institution_cct: userContext.institution_cct || (tenantId === 'ibime' ? '09PPR1492Z' : '09DPR0000Z'),
      tenant_id: tenantId,
      created_at: nowIso,
      updated_at: nowIso,
      signature_sha256: signature
    };

    // 4. Determinar la referencia en la Bóveda Curricular
    const safeSubject = input.subject_code.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const vaultRef = tenantId === 'ibime'
      ? `planeaciones/IBIME/Fase${input.phase || 4}/${input.grade}_Grado/${safeSubject}/${planId}.md`
      : (input.vault_node_ref || `planeaciones/Primaria_Fase_4/4to_Grado/${safeSubject}/${planId}.md`);

    const completePlan: CurriculumPlan = {
      id: planId,
      tenant_id: tenantId,
      parent_plan_id: input.parent_plan_id,
      title: input.title,
      subject_code: input.subject_code,
      phase: input.phase,
      grade: input.grade,
      curriculum_standard: input.curriculum_standard,
      didactic_intent: input.didactic_intent,
      sessions: input.sessions,
      evaluation_rubric: input.evaluation_rubric,
      bicultural_adaptations: input.bicultural_adaptations,
      audit_trail: auditTrail,
      vault_node_ref: vaultRef,
      is_custom_overlay: isOverlay
    };

    // 5. Persistir en el Namespace Propio del Tenant
    const tenantMap = this.plansByTenant.get(tenantId)!;
    tenantMap.set(planId, completePlan);

    // 6. Respaldo físico seguro en disco dentro de la Bóveda Curricular si aplica
    this.persistPlanToVaultDisk(completePlan);

    return completePlan;
  }

  /**
   * Persiste la planeación en formato Markdown con Frontmatter YAML en la carpeta aislada de IBIME
   */
  private static persistPlanToVaultDisk(plan: CurriculumPlan): void {
    try {
      const baseDir = path.join(process.cwd(), 'planeaciones');
      if (!fs.existsSync(baseDir)) return;

      const targetDir = plan.tenant_id === 'ibime'
        ? path.join(baseDir, 'IBIME', `Fase_${plan.phase || 4}`, `${plan.grade}_Grado`)
        : path.join(baseDir, 'Custom_Overlays');

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const filePath = path.join(targetDir, `${plan.id}.md`);
      const fileContent = this.formatPlanToMarkdown(plan);
      fs.writeFileSync(filePath, fileContent, 'utf8');
    } catch (err) {
      console.warn(`[CurriculumFederationService] Advertencia al persistir en disco: ${(err as Error).message}`);
    }
  }

  /**
   * Serializa la planeación en formato Markdown canónico con Frontmatter YAML y enlaces bidireccionales
   */
  private static formatPlanToMarkdown(plan: CurriculumPlan): string {
    const frontmatter = [
      '---',
      `id: "${plan.id}"`,
      `tenant_id: "${plan.tenant_id}"`,
      plan.parent_plan_id ? `parent_plan_id: "${plan.parent_plan_id}"` : null,
      `docente_autor: "${plan.audit_trail.author_name}"`,
      `docente_email: "${plan.audit_trail.author_email}"`,
      `institucion_cct: "${plan.audit_trail.institution_cct}"`,
      `asignatura: "${plan.subject_code}"`,
      `grado: "${plan.grade}"`,
      `fase: "${plan.phase || 4}"`,
      `marco_curricular: "${plan.curriculum_standard.framework}"`,
      `pda_code: "${plan.curriculum_standard.pda_code || ''}"`,
      `signature_sha256: "${plan.audit_trail.signature_sha256}"`,
      `created_at: "${plan.audit_trail.created_at}"`,
      '---',
      '',
      `# 📚 ${plan.title}`,
      '',
      `> **Docente Titular:** [[${plan.audit_trail.author_name}]]  `,
      `> **Institución:** ${plan.tenant_id.toUpperCase()} (CCT: ${plan.audit_trail.institution_cct})  `,
      `> **Asignatura y Grado:** ${plan.subject_code.toUpperCase()} • Grado ${plan.grade}  `,
      `> **Marco Curricular:** ${plan.curriculum_standard.framework}  `,
      '',
      '## 🎯 I. Propósito Didáctico y PDA Oficial',
      `* **PDA Oficial:** ${plan.curriculum_standard.pda_description}`,
      `* **Intención Didáctica:** ${plan.didactic_intent}`,
      '',
      '## ⏱️ II. Sesiones Didácticas Cronometradas',
      ...plan.sessions.map(s => [
        `### Sesión ${s.session_number} (${s.duration_minutes} min)`,
        `- **Inicio:** ${s.moments.inicio}`,
        `- **Desarrollo:** ${s.moments.desarrollo}`,
        `- **Cierre:** ${s.moments.cierre}`,
        ''
      ].join('\n')),
      '## 📊 III. Rúbrica Analítica de Evaluación',
      ...plan.evaluation_rubric.map(r => [
        `### Criterio: ${r.criterion} (Ponderación: ${r.weight_percent}%)`,
        `- **Sobresaliente:** ${r.descriptors.sobresaliente}`,
        `- **Satisfactorio:** ${r.descriptors.satisfactorio}`,
        `- **En Proceso:** ${r.descriptors.en_proceso}`,
        ''
      ].join('\n'))
    ].filter(line => line !== null).join('\n');

    return frontmatter;
  }

  // ==========================================================================
  // EXPORTACIÓN E IMPORTACIÓN SEGURA ENTRE BÓVEDAS (REST / JSON CANÓNICO)
  // ==========================================================================

  /**
   * Exporta el catálogo curricular de un Tenant en un paquete canónico auditable y firmado.
   */
  public static async exportCurriculumPackage(
    tenantId: TenantId,
    filter?: CurriculumCatalogFilter
  ): Promise<CurriculumExportPackage> {
    const plans = await this.getPlansForTenant(tenantId, filter);
    const nowIso = new Date().toISOString();

    const rawContent = JSON.stringify(plans);
    const checksum = crypto.createHash('sha256').update(rawContent).digest('hex');

    return {
      format_version: '1.0.0',
      exported_at: nowIso,
      exporter_tenant: tenantId,
      total_plans: plans.length,
      plans,
      package_checksum: checksum
    };
  }

  /**
   * Ingesta de forma hermética un paquete de planeaciones o rúbricas hacia el namespace
   * del Tenant receptor, con validación de integridad, sanitización PII y auditoría.
   */
  public static async importCurriculumPackage(
    pkg: CurriculumExportPackage,
    userContext: UserAuditContext
  ): Promise<{ importedCount: number; planIds: string[] }> {
    this.initialize();

    // 1. Verificación de Integridad del Paquete
    const computedChecksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(pkg.plans))
      .digest('hex');

    if (computedChecksum !== pkg.package_checksum) {
      throw new Error('Integridad de paquete fallida: El checksum SHA-256 no coincide con el contenido.');
    }

    const importedIds: string[] = [];

    // 2. Ingesta secuencial segura bajo el namespace del usuario receptor
    for (const plan of pkg.plans) {
      const importedPlan = await this.saveOrExtendPlan(
        {
          id: `${userContext.tenant_id}-imp-${plan.id}`,
          parent_plan_id: plan.parent_plan_id || (plan.tenant_id !== userContext.tenant_id ? plan.id : undefined),
          title: plan.title,
          subject_code: plan.subject_code,
          phase: plan.phase,
          grade: plan.grade,
          curriculum_standard: plan.curriculum_standard,
          didactic_intent: plan.didactic_intent,
          sessions: plan.sessions,
          evaluation_rubric: plan.evaluation_rubric,
          bicultural_adaptations: plan.bicultural_adaptations
        },
        userContext
      );

      importedIds.push(importedPlan.id);
    }

    return {
      importedCount: importedIds.length,
      planIds: importedIds
    };
  }

  // ==========================================================================
  // FILTRADO DINÁMICO
  // ==========================================================================

  private static applyFilter(plans: CurriculumPlan[], filter?: CurriculumCatalogFilter): CurriculumPlan[] {
    if (!filter) return plans;

    return plans.filter(p => {
      if (filter.subject_code && p.subject_code.toLowerCase() !== filter.subject_code.toLowerCase()) {
        return false;
      }
      if (filter.grade && String(p.grade) !== String(filter.grade)) {
        return false;
      }
      if (filter.phase && p.phase !== filter.phase) {
        return false;
      }
      if (filter.framework && p.curriculum_standard.framework !== filter.framework) {
        return false;
      }
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesPda = p.curriculum_standard.pda_description.toLowerCase().includes(query);
        if (!matchesTitle && !matchesPda) return false;
      }
      return true;
    });
  }
}
