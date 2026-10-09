// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';
import { UserAuditContext, CreateOrExtendPlanInput } from '@/lib/curriculum/types';

describe('📚 FEDERACIÓN E INTEROPERABILIDAD CURRICULAR: iSkool Core e IBIME', () => {

  const ibimeTeacherContext: UserAuditContext = {
    user_id: 'usr-ibime-prof-88',
    name: 'Prof. Ana Sofía Martínez',
    email: 'ana.martinez@ibime.edu.mx',
    role: 'teacher',
    tenant_id: 'ibime',
    institution_cct: '09PPR1492Z'
  };

  const iskoolTeacherContext: UserAuditContext = {
    user_id: 'usr-iskool-prof-12',
    name: 'Prof. Israel López Ángeles',
    email: 'israel.lopez@iskool.edu.mx',
    role: 'teacher',
    tenant_id: 'iskool',
    institution_cct: '09DPR0000Z'
  };

  beforeEach(() => {
    CurriculumFederationService.initialize();
  });

  describe('1. Consulta del Catálogo Central de iSkool Core', () => {
    it('debe permitir consultar los planes base canónicos de iSkool', async () => {
      const centralPlans = await CurriculumFederationService.getCentralCatalog();

      expect(centralPlans.length).toBeGreaterThanOrEqual(2);
      const waterPlan = centralPlans.find(p => p.id === 'plan-nem-f4-g4-cie-001');

      expect(waterPlan).toBeDefined();
      expect(waterPlan?.tenant_id).toBe('iskool');
      expect(waterPlan?.curriculum_standard.framework).toBe('NEM 2024');
      expect(waterPlan?.is_custom_overlay).toBe(false);
    });

    it('debe filtrar adecuadamente por asignatura y grado', async () => {
      const mathPlans = await CurriculumFederationService.getCentralCatalog({
        subject_code: 'matematicas',
        grade: 5
      });

      expect(mathPlans.length).toBe(1);
      expect(mathPlans[0].subject_code).toBe('matematicas');
      expect(mathPlans[0].grade).toBe(5);
    });
  });

  describe('2. Extensión y Sobrescritura Hermética en Namespace de IBIME', () => {
    it('debe permitir a un docente de IBIME extender una planeación central sin sobreescribir la original de iSkool', async () => {
      const overlayInput: CreateOrExtendPlanInput = {
        parent_plan_id: 'plan-nem-f4-g4-cie-001',
        title: 'Water Filtration and Eco-Engineering (Adaptación Bicultural IBIME)',
        subject_code: 'ciencias',
        phase: 4,
        grade: 4,
        curriculum_standard: {
          framework: 'BICULTURAL_IBIME',
          pda_code: 'PDA-CIE-F4-4TO-035',
          pda_description: 'Indaga el ciclo hidrológico con andamiaje bilingüe y diseña filtros de agua con vocabulario técnico en inglés.'
        },
        didactic_intent: 'Fortalecer el pensamiento científico con enfoque CLIL (Content and Language Integrated Learning).',
        sessions: [
          {
            session_number: 1,
            duration_minutes: 50,
            moments: {
              inicio: 'Trigger question in English: "Where does drinking water come from in our city?"',
              desarrollo: 'Hands-on laboratory station: water condensation and evaporation.',
              cierre: 'Exit ticket with scientific vocabulary and interactive canvas feedback.'
            }
          }
        ],
        evaluation_rubric: [
          {
            criterion: 'Scientific Inquiry & Bilingual Communication',
            weight_percent: 100,
            descriptors: {
              sobresaliente: 'Explains hydrological cycle using accurate scientific terms in both English and Spanish.',
              satisfactorio: 'Participates in laboratory demonstrations and uses target vocabulary.',
              en_proceso: 'Requires teacher guidance to formulate basic scientific hypotheses.'
            }
          }
        ],
        bicultural_adaptations: {
          language_target: 'EN',
          bilingual_scaffolding: ['evaporation', 'condensation', 'precipitation', 'water filter'],
          transcultural_moment: 'Comparison between Mexican watershed protection and global UNESCO water goals.',
          cefr_level: 'A2'
        }
      };

      const savedOverlay = await CurriculumFederationService.saveOrExtendPlan(
        overlayInput,
        ibimeTeacherContext
      );

      // Verificaciones del Overlay
      expect(savedOverlay.tenant_id).toBe('ibime');
      expect(savedOverlay.parent_plan_id).toBe('plan-nem-f4-g4-cie-001');
      expect(savedOverlay.is_custom_overlay).toBe(true);
      expect(savedOverlay.audit_trail.author_name).toBe('Prof. Ana Sofía Martínez');
      expect(savedOverlay.audit_trail.institution_cct).toBe('09PPR1492Z');
      expect(savedOverlay.audit_trail.signature_sha256).toBeDefined();

      // Verificación Hermética: La planeación central de iSkool permanece intacta y pura
      const originalIskoolPlan = await CurriculumFederationService.resolvePlan(
        'plan-nem-f4-g4-cie-001',
        'iskool'
      );

      expect(originalIskoolPlan).toBeDefined();
      expect(originalIskoolPlan?.title).toBe('Cuidado y Filtración del Agua en la Comunidad Escolar');
      expect(originalIskoolPlan?.tenant_id).toBe('iskool');
      expect(originalIskoolPlan?.is_custom_overlay).toBe(false);
      expect(originalIskoolPlan?.bicultural_adaptations).toBeUndefined();
    });
  });

  describe('3. Resolución Jerárquica Contextual (Overlay Pattern)', () => {
    it('debe entregar la versión bicultural a docentes de IBIME y la versión estándar a docentes de iSkool', async () => {
      // 1. Docente de IBIME consulta el plan
      const resolvedForIbime = await CurriculumFederationService.resolvePlan(
        'plan-nem-f4-g4-cie-001',
        'ibime'
      );

      expect(resolvedForIbime).toBeDefined();
      expect(resolvedForIbime?.tenant_id).toBe('ibime');
      expect(resolvedForIbime?.is_custom_overlay).toBe(true);
      expect(resolvedForIbime?.title).toContain('Adaptación Bicultural IBIME');

      // 2. Docente de iSkool consulta el mismo ID de plan
      const resolvedForIskool = await CurriculumFederationService.resolvePlan(
        'plan-nem-f4-g4-cie-001',
        'iskool'
      );

      expect(resolvedForIskool).toBeDefined();
      expect(resolvedForIskool?.tenant_id).toBe('iskool');
      expect(resolvedForIskool?.is_custom_overlay).toBe(false);
      expect(resolvedForIskool?.title).not.toContain('Bicultural');
    });

    it('debe permitir a docentes de IBIME heredar planes de iSkool si no existe un overlay específico', async () => {
      // Plan de matemáticas de 5to no tiene overlay de IBIME
      const resolvedMath = await CurriculumFederationService.resolvePlan(
        'plan-nem-f5-g5-mat-002',
        'ibime'
      );

      expect(resolvedMath).toBeDefined();
      expect(resolvedMath?.id).toBe('plan-nem-f5-g5-mat-002');
      expect(resolvedMath?.is_custom_overlay).toBe(false);
    });
  });

  describe('4. Prevención de Violaciones de Privacidad (Zero PII Guard)', () => {
    it('debe rechazar cualquier intento de guardar una planeación con datos personales o CURP de menores', async () => {
      const contaminatedPlan: CreateOrExtendPlanInput = {
        title: 'Evaluación formativa Grupo 4A',
        subject_code: 'ciencias',
        grade: 4,
        curriculum_standard: {
          framework: 'NEM 2024',
          pda_description: 'Indaga el ciclo del agua.'
        },
        didactic_intent: 'Prueba con alumno: Juan Perez Perez con curp: PEPJ160512HMCRRL09 para seguimiento.',
        sessions: [
          {
            session_number: 1,
            duration_minutes: 50,
            moments: { inicio: 'Inicio', desarrollo: 'Desarrollo', cierre: 'Cierre' }
          }
        ],
        evaluation_rubric: []
      };

      await expect(
        CurriculumFederationService.saveOrExtendPlan(contaminatedPlan, ibimeTeacherContext)
      ).rejects.toThrow('[VIOLACIÓN DE PRIVACIDAD DE MENORES]');
    });
  });

  describe('5. Exportación e Importación Segura de Paquetes Curriculares', () => {
    it('debe exportar un paquete curricular firmado y verificar su importación en otro contexto', async () => {
      // 1. Exportar catálogo de IBIME
      const exportedPkg = await CurriculumFederationService.exportCurriculumPackage('ibime');

      expect(exportedPkg.exporter_tenant).toBe('ibime');
      expect(exportedPkg.total_plans).toBeGreaterThan(0);
      expect(exportedPkg.package_checksum).toBeDefined();

      // 2. Coordinación de IBIME importa el paquete en un nuevo entorno
      const importResult = await CurriculumFederationService.importCurriculumPackage(
        exportedPkg,
        ibimeTeacherContext
      );

      expect(importResult.importedCount).toBe(exportedPkg.total_plans);
      expect(importResult.planIds.length).toBe(exportedPkg.total_plans);
    });

    it('debe rechazar la importación de un paquete manipulado (Checksum Tampering)', async () => {
      const validPkg = await CurriculumFederationService.exportCurriculumPackage('ibime');

      // Manipular el checksum para simular corrupción en tránsito
      const tamperedPkg = {
        ...validPkg,
        package_checksum: 'checksum_falsificado_000000000000000000000000'
      };

      await expect(
        CurriculumFederationService.importCurriculumPackage(tamperedPkg, ibimeTeacherContext)
      ).rejects.toThrow('Integridad de paquete fallida');
    });
  });
});
